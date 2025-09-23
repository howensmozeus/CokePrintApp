<<<<<<< HEAD
# Image to PDF Converter

A simple web application to convert images to PDF with a specific layout. Upload up to 9 images and convert them into a PDF document with dimensions 210mm × 148mm, arranged in a 3x3 grid.

## Features

- Select up to 9 images via file dialog or drag-and-drop
- Preview selected images before conversion
- Generate PDF with specific dimensions (210mm × 148mm)
- Arrange images in a 3x3 grid with customized margins and spacing
- Automatic PDF download
- Drag and drop PDF to other applications
- Sequential PDF naming with counter (finaloutput.001.pdf, finaloutput.002.pdf, etc.)

## Technologies Used

- React 19
- jsPDF (PDF generation)
- TailwindCSS (styling)

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd image-to-pdf-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory, ready to be deployed to any static web server.

## Usage Instructions

1. Click the "Select 9 Images" button or drag and drop your images into the drop zone
2. If you select more than 9 images, you'll enter selection mode where you can choose exactly 9 
3. Review your selected images in the preview area
4. Click "Generate PDF" to create your PDF with the 3x3 grid layout
5. The PDF will automatically download, and remain available for additional downloads or drag-and-drop

## License

[Your license information]

## Credits

Created by MoZeus
=======
# CokePrintApp
A web based app to convert png to PDF with correct formating
>>>>>>> 5ae33a709c7a4eb49fb216b9944d3b7ce04801e6
