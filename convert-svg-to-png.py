#!/usr/bin/env python3
"""
将SVG转换为PNG图标的脚本
需要安装: pip install cairosvg Pillow
"""

try:
    import cairosvg
    from PIL import Image
    import io
    import os
    
    def svg_to_png(svg_file, size, output_file):
        """将SVG转换为指定尺寸的PNG"""
        # 读取SVG文件
        with open(svg_file, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # 将SVG转换为PNG字节流
        png_bytes = cairosvg.svg2png(
            bytestring=svg_content.encode('utf-8'),
            output_width=size,
            output_height=size
        )
        
        # 使用PIL处理图像
        img = Image.open(io.BytesIO(png_bytes))
        
        # 确保icons目录存在
        os.makedirs('icons', exist_ok=True)
        
        # 保存PNG文件
        img.save(f'icons/{output_file}')
        print(f"已创建: icons/{output_file} ({size}x{size})")
    
    # 生成各种尺寸的图标
    sizes = [
        (16, 'icon-16.png'),
        (32, 'icon-32.png'),
        (48, 'icon-48.png'),
        (128, 'icon-128.png')
    ]
    
    svg_file = 'icon.svg'
    
    if not os.path.exists(svg_file):
        print(f"错误: 找不到 {svg_file} 文件")
        exit(1)
    
    for size, filename in sizes:
        svg_to_png(svg_file, size, filename)
    
    print("所有图标转换完成！")
    
    # 更新 manifest.json 的提示
    print("\n请将以下内容添加到 manifest.json 中：")
    print("""
在 "action" 中添加：
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },

在根级别添加：
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
    """)
    
except ImportError as e:
    print("请先安装必要的库:")
    print("pip install cairosvg Pillow")
    print(f"\n缺少的库: {e}")
    
    # 提供备用方案
    print("\n备用方案: 可以使用在线工具转换SVG到PNG")
    print("1. 访问 https://convertio.co/svg-png/")
    print("2. 上传 icon.svg 文件")
    print("3. 设置输出尺寸为 16x16, 32x32, 48x48, 128x128")
    print("4. 下载并重命名为对应的文件名放入 icons/ 文件夹")

except Exception as e:
    print(f"转换过程中出现错误: {e}")
    print("请检查 icon.svg 文件是否存在且格式正确")