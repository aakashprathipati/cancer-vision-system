import torch
import torch.nn.functional as F
import numpy as np
import math

class MedicalInferenceEngine:
    """
    Inference engine that uses Sliding Window Prediction with Gaussian importance weighting.
    Eliminates border artifacts and generates diagnostic outputs for VisioData AI Integration.
    """
    def __init__(self, model, window_size=(128, 128), overlap=0.5, device='cpu'):
        self.model = model
        self.window_size = window_size
        self.overlap = overlap
        self.device = device
        self.model.to(device)
        self.model.eval()
        self.gaussian_map = self._get_gaussian(window_size).to(device)

    def _get_gaussian(self, window_size, sigma_scale=1. / 8):
        """
        Creates a Gaussian importance weighting map for the sliding window.
        """
        import scipy.stats as st
        # Create a Gaussian kernel
        tmp = np.zeros(window_size)
        center = [s // 2 for s in window_size]
        sigmas = [s * sigma_scale for s in window_size]
        
        # 2D Gaussian
        x = np.arange(0, window_size[1], 1, float)
        y = np.arange(0, window_size[0], 1, float)
        y = y[:, np.newaxis]
        
        x0 = center[1]
        y0 = center[0]
        
        gaussian_map = np.exp(-4*np.log(2) * ((x-x0)**2 / window_size[1]**2 + (y-y0)**2 / window_size[0]**2))
        return torch.from_numpy(gaussian_map).float().unsqueeze(0).unsqueeze(0) # [1, 1, H, W]

    def predict_sliding_window(self, image_tensor):
        """
        image_tensor: [1, C, H, W]
        """
        _, C, H, W = image_tensor.shape
        step_y = int(self.window_size[0] * (1 - self.overlap))
        step_x = int(self.window_size[1] * (1 - self.overlap))
        
        num_classes = self.model.num_classes
        
        # Output probability map and weight map
        pred_map = torch.zeros((1, num_classes, H, W), device=self.device)
        weight_map = torch.zeros((1, 1, H, W), device=self.device)
        
        # Pad image if it's smaller than the window size
        pad_h = max(0, self.window_size[0] - H)
        pad_w = max(0, self.window_size[1] - W)
        if pad_h > 0 or pad_w > 0:
            image_tensor = F.pad(image_tensor, (0, pad_w, 0, pad_h))
            pred_map = F.pad(pred_map, (0, pad_w, 0, pad_h))
            weight_map = F.pad(weight_map, (0, pad_w, 0, pad_h))
            _, _, H, W = image_tensor.shape
            
        y_starts = list(range(0, H - self.window_size[0] + 1, step_y))
        x_starts = list(range(0, W - self.window_size[1] + 1, step_x))
        
        # Ensure the last window reaches the edge
        if y_starts[-1] != H - self.window_size[0]:
            y_starts.append(H - self.window_size[0])
        if x_starts[-1] != W - self.window_size[1]:
            x_starts.append(W - self.window_size[1])
            
        with torch.no_grad():
            for y in y_starts:
                for x in x_starts:
                    window = image_tensor[:, :, y:y+self.window_size[0], x:x+self.window_size[1]]
                    window = window.to(self.device)
                    
                    # Inference
                    logits = self.model(window)
                    # Support deep supervision returns (takes highest resolution)
                    if isinstance(logits, (list, tuple)):
                        logits = logits[0]
                        
                    probs = F.softmax(logits, dim=1)
                    
                    # Apply Gaussian weighting
                    weighted_probs = probs * self.gaussian_map
                    
                    pred_map[:, :, y:y+self.window_size[0], x:x+self.window_size[1]] += weighted_probs
                    weight_map[:, :, y:y+self.window_size[0], x:x+self.window_size[1]] += self.gaussian_map

        # Normalize by weights
        pred_map /= weight_map
        
        # Remove padding if it was added
        if pad_h > 0 or pad_w > 0:
            pred_map = pred_map[:, :, :H-pad_h, :W-pad_w]
            
        return pred_map

    def generate_diagnostic_report(self, image_tensor, min_mask_area=100, confidence_threshold=50.0):
        """
        Produces the VisioData AI Integration outputs:
        - high-resolution binary mask
        - confidence score indicating probability of malignancy
        - diagnostic message
        """
        pred_map = self.predict_sliding_window(image_tensor)
        
        # We have 3 types of cancers (1: Melanoma, 2: BCC, 3: SCC)
        mel_probs = pred_map[:, 1, :, :] if pred_map.shape[1] > 1 else torch.zeros_like(pred_map[:, 0, :, :])
        bcc_probs = pred_map[:, 2, :, :] if pred_map.shape[1] > 2 else torch.zeros_like(pred_map[:, 0, :, :])
        scc_probs = pred_map[:, 3, :, :] if pred_map.shape[1] > 3 else torch.zeros_like(pred_map[:, 0, :, :])
        
        # Combined probability of any lesion
        lesion_probs = mel_probs + bcc_probs + scc_probs
        
        # 1. High-resolution binary mask (any lesion)
        binary_mask = (lesion_probs > 0.5).int().squeeze().cpu().numpy()
        
        # 2. Filter out small noise
        mask_area = binary_mask.sum()
        if mask_area < min_mask_area:
            binary_mask = np.zeros_like(binary_mask)
            mask_area = 0
            
        # 3. Confidence Score
        if mask_area > 0:
            confidence = torch.mean(lesion_probs[lesion_probs > 0.5]).item() * 100.0
        else:
            confidence = torch.max(lesion_probs).item() * 100.0
            
        # Determine the most likely cancer type based on mean prob in mask area
        cancer_types = {1: "Melanoma", 2: "Basal Cell Carcinoma", 3: "Squamous Cell Carcinoma"}
        mean_probs = [
            torch.mean(mel_probs[lesion_probs > 0.5]).item() if mask_area > 0 else 0,
            torch.mean(bcc_probs[lesion_probs > 0.5]).item() if mask_area > 0 else 0,
            torch.mean(scc_probs[lesion_probs > 0.5]).item() if mask_area > 0 else 0
        ]
            
        # 4. Generate diagnosis message
        if mask_area == 0 or confidence < confidence_threshold:
            message = "there is no cancer sign in the provided image"
            if mask_area == 0:
                confidence = min(confidence, 10.0)
        else:
            most_likely_idx = np.argmax(mean_probs) + 1
            detected_type = cancer_types[most_likely_idx]
            message = f"potential signs of malignancy detected. High risk of {detected_type}."
            
        return {
            'binary_mask': binary_mask,
            'confidence_score_percent': round(confidence, 2),
            'probability_map': lesion_probs.squeeze().cpu().numpy(),
            'message': message
        }
