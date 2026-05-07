import os
import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from dataset import SkinLesionDataset
from architecture import DynamicUNet2D
from loss import DeepSupervisionLoss
import torchvision.transforms as transforms

def train_model(data_dir="data", epochs=3, batch_size=4, lr=1e-4, device="cpu"):
    """
    Main training loop for the SmartVision AI Engine.
    Loads the dataset, passes it through the Dynamic U-Net, and saves the trained weights.
    """
    print(f"Starting training on device: {device}")
    
    images_dir = os.path.join(data_dir, "images")
    masks_dir = os.path.join(data_dir, "masks")
    
    if not os.path.exists(images_dir) or not os.path.exists(masks_dir):
        print("Dataset not found! Please run download_real_data.py first.")
        return
        
    # Standard image transforms
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # 1. Load Dataset
    print(f"Loading dataset from {data_dir}...")
    dataset = SkinLesionDataset(images_dir, masks_dir, transform=transform)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    # 2. Initialize Model, Loss, and Optimizer
    print("Initializing DynamicUNet2D Architecture for 4 Classes (Background, Melanoma, BCC, SCC)...")
    model = DynamicUNet2D(in_channels=3, num_classes=4).to(device)
    criterion = DeepSupervisionLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr)
    
    # Create weights directory
    weights_dir = os.path.join(os.path.dirname(__file__), "weights")
    os.makedirs(weights_dir, exist_ok=True)
    
    # 3. Training Loop
    print(f"Commencing training for {epochs} epochs...")
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0.0
        
        for batch_idx, (images, masks) in enumerate(dataloader):
            images, masks = images.to(device), masks.to(device)
            
            # Zero gradients
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(images)
            
            # Compute Loss (DeepSupervisionLoss handles list of outputs internally)
            loss = criterion(outputs, masks)
                
            # Backward pass & Optimize
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
            if (batch_idx + 1) % 10 == 0:
                print(f"      Batch [{batch_idx+1}/{len(dataloader)}] - Loss: {loss.item():.4f}")
            
        avg_loss = epoch_loss / len(dataloader)
        print(f"   Epoch [{epoch+1}/{epochs}] - Loss: {avg_loss:.4f}")
        
        # Save trained weights for this epoch
        weight_path = os.path.join(weights_dir, f"model_weights_epoch_{epoch+1}.pth")
        torch.save(model.state_dict(), weight_path)
        print(f"   Saved weights to {weight_path}")
        
    print("Training complete! The AI model is now trained and ready for inference.")

if __name__ == "__main__":
    # Use CUDA if available, otherwise CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Specify the local data directory where download_real_data.py outputs
    data_path = os.path.join(os.path.dirname(__file__), "data")
    
    # Run training
    train_model(data_dir=data_path, device=device)
