import torch

checkpoint = torch.load("unet_model.pth", map_location="cpu")
if isinstance(checkpoint, dict):
    print("Checkpoint keys:", list(checkpoint.keys()))
else:
    print("Loaded object type:", type(checkpoint))
