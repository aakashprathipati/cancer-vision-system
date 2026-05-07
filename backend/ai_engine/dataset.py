import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as transforms

class SkinLesionDataset(Dataset):
    """
    PyTorch Dataset for loading Skin Lesion Images and their Binary Masks.
    """
    def __init__(self, images_dir, masks_dir, transform=None):
        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.transform = transform
        
        # Only include valid image files
        valid_ext = ('.jpg', '.jpeg', '.png')
        self.images = sorted([f for f in os.listdir(images_dir) if f.lower().endswith(valid_ext)])
        self.masks = sorted([f for f in os.listdir(masks_dir) if f.lower().endswith(valid_ext)])
        
        assert len(self.images) == len(self.masks), "Mismatch between number of images and masks!"

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = os.path.join(self.images_dir, self.images[idx])
        mask_path = os.path.join(self.masks_dir, self.masks[idx])
        
        image = Image.open(img_path).convert("RGB")
        mask = Image.open(mask_path).convert("L") # Grayscale
        
        if self.transform:
            image = self.transform(image)
            # Mask needs to be resized to the same size but keeping integer labels
            mask_transform = transforms.Compose([
                transforms.Resize((image.shape[1], image.shape[2]), interpolation=transforms.InterpolationMode.NEAREST),
                transforms.ToTensor()
            ])
            mask = mask_transform(mask)
            
        # Convert mask back to class integers (ToTensor scales 0-255 to 0.0-1.0)
        mask = (mask * 255).round().long().squeeze(0) # Shape: [H, W]
        return image, mask
