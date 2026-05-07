import torch
import torch.nn as nn
import torch.nn.functional as F

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels, dropout_p=0.0):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.in1 = nn.InstanceNorm2d(out_channels)
        self.lrelu1 = nn.LeakyReLU(negative_slope=0.01, inplace=True)
        
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
        self.in2 = nn.InstanceNorm2d(out_channels)
        self.lrelu2 = nn.LeakyReLU(negative_slope=0.01, inplace=True)
        self.dropout = nn.Dropout2d(dropout_p) if dropout_p > 0 else nn.Identity()

    def forward(self, x):
        x = self.conv1(x)
        x = self.in1(x)
        x = self.lrelu1(x)
        x = self.dropout(x)
        x = self.conv2(x)
        x = self.in2(x)
        x = self.lrelu2(x)
        x = self.dropout(x)
        return x

class DynamicUNet2D(nn.Module):
    """
    Dynamic 2D U-Net inspired by nnU-Net v2 for skin lesion segmentation.
    Features:
    - Instance Normalization & Leaky ReLU
    - Deep Supervision (outputs at multiple resolution levels)
    """
    def __init__(self, in_channels=3, num_classes=2, base_filters=32, num_pool=5, deep_supervision=True):
        super().__init__()
        self.num_classes = num_classes
        self.deep_supervision = deep_supervision
        self.num_pool = num_pool
        
        self.encoders = nn.ModuleList()
        self.downsamples = nn.ModuleList()
        
        # Encoder path
        current_in = in_channels
        for i in range(num_pool):
            out_channels = base_filters * (2 ** i)
            self.encoders.append(ConvBlock(current_in, out_channels, dropout_p=0.1 if i > 2 else 0.0))
            self.downsamples.append(nn.MaxPool2d(2, 2))
            current_in = out_channels
            
        # Bottleneck
        bottleneck_channels = base_filters * (2 ** num_pool)
        self.bottleneck = ConvBlock(current_in, bottleneck_channels, dropout_p=0.3)
        
        # Decoder path
        self.upsamples = nn.ModuleList()
        self.decoders = nn.ModuleList()
        self.deep_supervision_heads = nn.ModuleList()
        
        current_in = bottleneck_channels
        for i in reversed(range(num_pool)):
            skip_channels = base_filters * (2 ** i)
            # Transposed Conv for upsampling (keeps features richer than bilinear)
            self.upsamples.append(nn.ConvTranspose2d(current_in, skip_channels, kernel_size=2, stride=2))
            
            # Decoder block gets concatenated input
            out_channels = skip_channels
            self.decoders.append(ConvBlock(skip_channels * 2, out_channels))
            
            # Deep Supervision Heads connecting directly to intermediate decoders
            if self.deep_supervision:
                self.deep_supervision_heads.append(nn.Conv2d(out_channels, num_classes, kernel_size=1))
                
            current_in = out_channels
            
        # Final output head (full resolution)
        self.final_conv = nn.Conv2d(current_in, num_classes, kernel_size=1)

    def forward(self, x):
        encoder_features = []
        
        # Encoder passes
        for i in range(self.num_pool):
            x = self.encoders[i](x)
            encoder_features.append(x)
            x = self.downsamples[i](x)
            
        # Bottleneck
        x = self.bottleneck(x)
        
        ds_outputs = []
        
        # Decoder passes
        for i in range(self.num_pool):
            x = self.upsamples[i](x)
            skip = encoder_features[-(i + 1)]
            x = torch.cat([x, skip], dim=1)
            x = self.decoders[i](x)
            
            if self.deep_supervision:
                ds_outputs.append(self.deep_supervision_heads[i](x))
                
        # Only return the final resolution prediction during inference
        # During training with deep supervision, return all resolution outputs
        if self.training and self.deep_supervision:
            ds_outputs[-1] = self.final_conv(x) # Overwrite last (highest res head) with final conv
            return ds_outputs[::-1] # Ordered from highest res to lowest res
            
        return self.final_conv(x)
