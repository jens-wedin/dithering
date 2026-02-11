# DITHER_OS v1.0 - Retro Dithering App

DITHER_OS is a web-based image processing tool designed with a retro "old computer console" aesthetic. It allows users to apply various dithering algorithms to images in real-time, providing extensive control over the final visual output.

![App Preview](file:///Users/jens.wedin/.gemini/antigravity/brain/3c16ad6f-20b4-4f57-98a0-dfaaba426a26/.system_generated/click_feedback/click_feedback_1770834919815.png)

## Features 

### 👾 Retro Design Philosophy
- **Monochrome Interface**: Classic black and green phosphor palette.
- **CRT Simulation**: Scanline overlays and subtle phosphor flicker for an authentic retro feel.
- **Terminal Aesthetics**: Monospace typography and sharp, grid-based layouts.

### 🎨 Advanced Dithering Algorithms
- **Floyd-Steinberg**: Popular error diffusion algorithm for smooth, high-quality gradients.
- **Atkinson**: Developed at Apple; provides a distinct, high-contrast look with reduced color bleed.
- **Ordered (Bayer)**: Creates a stylized, matrix-based pattern reminiscent of early digital displays.

### 🛠️ Real-time Controls
- **Image Upload**: Drag and drop or select any image to process immediately.
- **Brightness & Contrast**: Fine-tune the source image before dithering.
- **Dither Levels**: Adjust the quantization levels (2-16) to control the depth of the effect.
- **Color Customization**: Select foreground and background colors to create unique monochromatic or two-tone palettes.
- **Collapsible Sidebar**: Hide the "DITHER_OS" menu to view your artwork in full-screen terminal mode.

### 💾 Export
- **PNG Download**: Save your dithered creations at the original image resolution.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository (or navigate to the project directory):
   ```bash
   cd dithering
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the address shown in your terminal (usually `http://localhost:5173`).

## Usage

1. Click **UPLOAD_IMAGE** or drag an image into the terminal area.
2. Use the **ALGORITHM** selector to choose your dithering style.
3. Adjust **BRIGHTNESS**, **CONTRAST**, and **DITHER LEVELS** to achieve the desired effect.
4. Experiment with **FG_COLOR** and **BG_COLOR** for custom palettes.
5. Click **DOWNLOAD_PNG** to save your dithered image.
6. Use **[ CLOSE ]** / **[ MENU ]** to toggle the sidebar.

## Technologies Used
- **React**: Frontend framework.
- **TypeScript**: Type-safe development.
- **Vite**: Ultra-fast build tool and dev server.
- **HTML5 Canvas**: High-performance real-time image processing.
- **CSS3**: Custom retro styling and animations.

---
Built with ❤️ in Retro Console Style.
