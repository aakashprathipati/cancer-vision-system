import os
import shutil
import numpy as np
from PIL import Image
import medmnist
from medmnist import DermaMNIST

def download_and_prepare_data(output_dir="data"):
    images_dir = os.path.join(output_dir, "images")
    masks_dir = os.path.join(output_dir, "masks")
    
    # Clear old data (e.g. mock data)
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
        
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(masks_dir, exist_ok=True)
    
    print("Downloading DermaMNIST (real skin cancer dataset from HAM10000)...")
    try:
        # Default MedMNIST is 28x28 (~20MB) which we will upscale to 224 locally
        dataset = DermaMNIST(split='train', download=True, size=28)
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        dataset = DermaMNIST(split='train', download=True)
    
    # DermaMNIST classes:
    # 0: akiec (Actinic keratoses / Squamous cell carcinoma related)
    # 1: bcc (Basal cell carcinoma)
    # 4: mel (Melanoma)
    
    class_mapping = {
        4: 1, # Melanoma -> Class 1
        1: 2, # BCC -> Class 2
        0: 3  # SCC/AKIEC -> Class 3
    }
    
    count = 0
    print("Extracting images and generating segmentation masks for 3 cancer types...")
    for i in range(len(dataset)):
        if count >= 300: # Limit for quick local training
            break
            
        img, label = dataset[i]
        label = label.item() if hasattr(label, 'item') else label[0]
        
        if label not in class_mapping:
            continue
            
        target_class = class_mapping[label]
        
        # img is a PIL Image
        if img.size[0] < 224:
            img = img.resize((224, 224), Image.BILINEAR)
            
        img_array = np.array(img)
        
        # Create a synthetic mask since DermaMNIST doesn't have masks
        # Assume the lesion is in the center
        size = img_array.shape[:2]
        center_x, center_y = size[1] // 2, size[0] // 2
        radius_x, radius_y = size[1] // 3, size[0] // 3
        
        y, x = np.ogrid[:size[0], :size[1]]
        mask_bool = ((x - center_x)**2 / radius_x**2) + ((y - center_y)**2 / radius_y**2) <= 1
        
        mask_array = np.zeros(size, dtype=np.uint8)
        mask_array[mask_bool] = target_class
        
        mask_img = Image.fromarray(mask_array)
        
        img.save(os.path.join(images_dir, f"real_c{target_class}_{count:04d}.jpg"))
        mask_img.save(os.path.join(masks_dir, f"real_c{target_class}_{count:04d}.png"))
        
        count += 1
        
    print(f"Successfully downloaded and prepared {count} real skin cancer images!")
    print("Classes: 1=Melanoma, 2=BCC, 3=SCC")

if __name__ == "__main__":
    download_and_prepare_data("c:/Users/ASUS/Documents/trae_projects/smartvision/backend/ai_engine/data")
