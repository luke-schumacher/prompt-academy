from PIL import Image, ImageDraw

def create_intro_bg():
    width = 600
    height = 400
    # Create a dark blue background, distinct from the start screen
    img = Image.new('RGB', (width, height), color='#0a1a2a')
    draw = ImageDraw.Draw(img)
    
    # Add a border
    border_color = '#00ffff'
    border_width = 4
    draw.rectangle([0, 0, width-1, height-1], outline=border_color, width=border_width)
    
    # Add some subtle tech-like grid lines
    grid_color = '#1a2a3a'
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    # Save the image
    img.save('assets/ui/intro_popup_bg.png')
    print("Created assets/ui/intro_popup_bg.png")

if __name__ == "__main__":
    create_intro_bg()
