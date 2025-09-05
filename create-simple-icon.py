#!/usr/bin/env python3
"""
简单的图标生成脚本
需要安装 Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # 创建图像
        img = Image.new('RGBA', (size, size), (51, 112, 255, 255))  # 飞书蓝色
        draw = ImageDraw.Draw(img)
        
        # 尝试使用系统字体
        try:
            font = ImageFont.truetype("Arial.ttf", size//2)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", size//2)
            except:
                font = ImageFont.load_default()
        
        # 绘制文字
        text = "文"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
        
        # 保存图标
        os.makedirs('icons', exist_ok=True)
        img.save(f'icons/{filename}')
        print(f"已创建: icons/{filename}")
    
    # 生成各种尺寸的图标
    sizes = [(16, 'icon-16.png'), (32, 'icon-32.png'), (48, 'icon-48.png'), (128, 'icon-128.png')]
    
    for size, filename in sizes:
        create_icon(size, filename)
    
    print("所有图标创建完成！")
    
except ImportError:
    print("请先安装 Pillow 库: pip install Pillow")
    print("或者直接加载插件，图标不是必需的")