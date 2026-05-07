import os
import glob
import numpy as np
import torch
import torchvision.transforms.functional as TF
from PIL import Image
from typing import Tuple, List

class DataFingerprinter:
    """
    Automated Pre-processing module: Analyze input skin images
    and calculate mean/std normalization based on the global statistics
    of dermatoscopic datasets.
    """
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        # Known global statistics for skin/ImageNet context if directory is empty
        self.mean = np.array([0.485, 0.456, 0.406])
        self.std = np.array([0.229, 0.224, 0.225])
        
    def extract_fingerprint(self) -> Tuple[np.ndarray, np.ndarray]:
        image_paths = glob.glob(os.path.join(self.data_dir, "**", "*.jpg"), recursive=True)
        image_paths += glob.glob(os.path.join(self.data_dir, "**", "*.jpeg"), recursive=True)
        image_paths += glob.glob(os.path.join(self.data_dir, "**", "*.png"), recursive=True)
        
        if not image_paths:
            print("No images found. Falling back to default ImageNet stats.")
            return self.mean, self.std
            
        print(f"Fingerprinting {len(image_paths)} images...")
        pixel_num = 0
        channel_sum = np.zeros(3)
        channel_sum_squared = np.zeros(3)
        
        for path in image_paths:
            try:
                img = Image.open(path).convert('RGB')
                img_np = np.array(img) / 255.0
                channel_sum += np.sum(img_np, axis=(0, 1))
                channel_sum_squared += np.sum(img_np ** 2, axis=(0, 1))
                pixel_num += (img_np.shape[0] * img_np.shape[1])
            except Exception as e:
                print(f"Error fingerprinting {path}: {e}")
                
        if pixel_num > 0:
            self.mean = channel_sum / pixel_num
            self.std = np.sqrt((channel_sum_squared / pixel_num) - (self.mean ** 2))
            print(f"Extracted Fingerprint - Mean: {self.mean}, Std: {self.std}")
            
        return self.mean, self.std

class AdaptiveResampler:
    """
    Implements adaptive resampling to ensure every image matches a target 
    resolution (e.g., 128x128) for consistent feature extraction.
    """
    def __init__(self, target_resolution=(128, 128), mean=None, std=None):
        self.target_resolution = target_resolution
        self.mean = mean if mean is not None else [0.485, 0.456, 0.406]
        self.std = std if std is not None else [0.229, 0.224, 0.225]
        
    def process_image(self, image: Image.Image) -> torch.Tensor:
        # Resize dynamically
        image = TF.resize(image, self.target_resolution, interpolation=TF.InterpolationMode.BILINEAR)
        # Convert to tensor
        tensor = TF.to_tensor(image) # [C, H, W] in [0.0, 1.0]
        # Normalize
        tensor = TF.normalize(tensor, mean=self.mean, std=self.std)
        return tensor
        
    def process_mask(self, mask: Image.Image) -> torch.Tensor:
        # Nearest neighbor interpolation for segmentation mask to retain discrete classes
        mask = TF.resize(mask, self.target_resolution, interpolation=TF.InterpolationMode.NEAREST)
        tensor = torch.from_numpy(np.array(mask)).long()
        # Ensure mask is 0 and 1
        tensor = (tensor > 0).long()
        return tensor
