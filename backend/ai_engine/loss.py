import torch
import torch.nn as nn
import torch.nn.functional as F

class SoftDiceLoss(nn.Module):
    def __init__(self, smooth=1e-5):
        super(SoftDiceLoss, self).__init__()
        self.smooth = smooth

    def forward(self, logits, targets):
        """
        logits: [B, C, H, W]
        targets: [B, H, W]
        """
        # Softmax to get probabilities
        probs = F.softmax(logits, dim=1)
        
        # One-hot encode targets
        targets_one_hot = F.one_hot(targets, num_classes=logits.shape[1]).permute(0, 3, 1, 2).float()
        
        # We compute dice score for the foreground class (assumes class 1 is lesion)
        # To handle multi-class generically, average the dice over all classes
        dims = (0, 2, 3) 
        intersection = torch.sum(probs * targets_one_hot, dim=dims)
        cardinality = torch.sum(probs + targets_one_hot, dim=dims)
        
        dice_score = (2. * intersection + self.smooth) / (cardinality + self.smooth)
        
        return 1. - torch.mean(dice_score)


class DiceCELoss(nn.Module):
    """
    Hybrid Soft Dice + Cross-Entropy Loss.
    Handles class imbalance.
    """
    def __init__(self, weight_ce=1.0, weight_dice=1.0):
        super(DiceCELoss, self).__init__()
        self.ce = nn.CrossEntropyLoss()
        self.dice = SoftDiceLoss()
        self.weight_ce = weight_ce
        self.weight_dice = weight_dice

    def forward(self, logits, targets):
        ce_loss = self.ce(logits, targets)
        dice_loss = self.dice(logits, targets)
        return (self.weight_ce * ce_loss) + (self.weight_dice * dice_loss)


class DeepSupervisionLoss(nn.Module):
    """
    Applies DiceCELoss to multiple decoder resolution levels.
    Lower resolutions get lower weights.
    """
    def __init__(self, weights=None):
        super(DeepSupervisionLoss, self).__init__()
        self.loss_fn = DiceCELoss()
        self.weights = weights # E.g., [1.0, 0.5, 0.25, 0.125, 0.0625]

    def forward(self, logits_list, target):
        """
        logits_list: List of output tensors from highest to lowest resolution.
        target: High resolution target mask [B, H, W]
        """
        if not isinstance(logits_list, (list, tuple)):
            return self.loss_fn(logits_list, target)
            
        if self.weights is None:
            self.weights = [1.0 / (2 ** i) for i in range(len(logits_list))]
            
        total_loss = 0
        for i, logits in enumerate(logits_list):
            if logits.shape[2:] != target.shape[1:]:
                # Downsample target to match intermediate outputs
                target_downsampled = F.interpolate(
                    target.unsqueeze(1).float(), 
                    size=logits.shape[2:], 
                    mode='nearest'
                ).squeeze(1).long()
            else:
                target_downsampled = target
                
            loss = self.loss_fn(logits, target_downsampled)
            total_loss += self.weights[i] * loss
            
        return total_loss
