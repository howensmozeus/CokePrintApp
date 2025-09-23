import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, FileText, Check, X } from 'lucide-react';
import * as _ from 'lodash';
// Import jsPDF for PDF generation
import { jsPDF } from 'jspdf';
// Import custom CSS
import './ImageToPdfConverter.css';

export default function ImageToPdfConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [fileCounter, setFileCounter] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPdf, setDraggedPdf] = useState(false);
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoDeleteSuccess, setAutoDeleteSuccess] = useState(false);
  const [maxImageCount, setMaxImageCount] = useState(3); // For 3 images
  const fileInputRef = useRef(null);
  const pdfRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Show selection mode if more than maxImageCount images are selected
      if (imageFiles.length > maxImageCount) {
        setAvailableImages(imageFiles);
        setShowSelectionMode(true);
      } else {
        // Add files
        const newFiles = [...selectedFiles, ...imageFiles].slice(0, maxImageCount);
        setSelectedFiles(newFiles);
      }
    }
    
    // Reset file input
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Show selection mode if more than maxImageCount images are dropped
      if (imageFiles.length > maxImageCount) {
        setAvailableImages(imageFiles);
        setShowSelectionMode(true);
      } else {
        // Add files
        const newFiles = [...selectedFiles, ...imageFiles].slice(0, maxImageCount);
        setSelectedFiles(newFiles);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  // Initialize file counter from localStorage
  useEffect(() => {
    const savedCounter = localStorage.getItem('pdfFileCounter');
    if (savedCounter) {
      setFileCounter(parseInt(savedCounter));
    }
  }, []);

  // Make PDF element draggable
  useEffect(() => {
    if (pdfRef.current) {
      pdfRef.current.addEventListener('dragstart', handlePdfDragStart);
      return () => {
        if (pdfRef.current) {
          pdfRef.current.removeEventListener('dragstart', handlePdfDragStart);
        }
      };
    }
  }, [pdfBlob]);

  const handlePdfDragStart = (e) => {
    if (pdfBlob) {
      // This will enable dragging the PDF to other applications
      e.dataTransfer.setData('application/pdf', pdfBlob);
      e.dataTransfer.setData('text/plain', pdfFileName);
      setDraggedPdf(true);
      
      // Create a drag image
      const dragImage = document.createElement('div');
      dragImage.textContent = pdfFileName;
      dragImage.style.background = '#f8f9fa';
      dragImage.style.padding = '10px';
      dragImage.style.borderRadius = '4px';
      dragImage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      document.body.appendChild(dragImage);
      
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      // Remove the drag image after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  const selectNineImages = () => {
    // Show a file selection dialog that allows selecting exactly 9 files
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleImageSelection = (image) => {
    // Check if image is already selected
    const isSelected = selectedFiles.some(file => file.name === image.name);
    
    if (isSelected) {
      // Remove from selection
      setSelectedFiles(selectedFiles.filter(file => file.name !== image.name));
    } else {
      // Add to selection if less than maxImageCount images are selected
      if (selectedFiles.length < maxImageCount) {
        setSelectedFiles([...selectedFiles, image]);
      }
    }
  };

  const confirmSelection = () => {
    setShowSelectionMode(false);
    // Selection is already handled by toggleImageSelection
  };

  const cancelSelection = () => {
    setShowSelectionMode(false);
    setAvailableImages([]);
  };

  const isImageSelected = (image) => {
    return selectedFiles.some(file => file.name === image.name);
  };

  // Function to clear all image selections
  const clearSelectedImages = () => {
    // Release object URLs to avoid memory leaks
    selectedFiles.forEach(file => {
      if (file._objectUrl) {
        URL.revokeObjectURL(file._objectUrl);
      }
    });
    
    // Clear the selectedFiles state
    setSelectedFiles([]);
    
    // Show auto-delete success message
    setAutoDeleteSuccess(true);
    
    // Hide the success message after 3 seconds
    setTimeout(() => {
      setAutoDeleteSuccess(false);
    }, 3000);
  };

  // Generate PDF with specific dimensions and landscape orientation
  const generatePDF = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a PDF file name with sequential numbering
      const formattedCounter = String(fileCounter).padStart(3, '0');
      const fileName = `finaloutput.${formattedCounter}`;
      setPdfFileName(`${fileName}.pdf`);
      
      // Store incremented counter in localStorage to persist between sessions
      const nextCounter = fileCounter + 1;
      localStorage.setItem('pdfFileCounter', nextCounter);
      setFileCounter(nextCounter);
      
      // Load all images as data URLs
      const imagePromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      const imageDataUrls = await Promise.all(imagePromises);
      
      // Create PDF with custom dimensions: 210mm x 148mm
      const pdfWidth = 210; // mm
      const pdfHeight = 148; // mm

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // 3-column layout for 240mm x 200mm page
      const sideMargin = 10; // mm margin from left/right edges
      const bottomPadding = 9.525; // 3/8 inch from bottom in mm (0.375 * 25.4)
      const topMargin = 10; // mm margin from top
      const columnGap = 10; // mm gap between columns
      const availableWidth = pdfWidth - (2 * sideMargin); // Total width minus side margins
      const columnWidth = (availableWidth - (2 * columnGap)) / 3; // Width per column
      const availableHeight = pdfHeight - bottomPadding - topMargin; // Height from top to 1 inch from bottom

      // Add images to the PDF in 3 columns
      for (let i = 0; i < Math.min(imageDataUrls.length, 3); i++) {
        // Create a temporary image to get dimensions
        const tempImg = new Image();
        await new Promise((resolve) => {
          tempImg.onload = resolve;
          tempImg.src = imageDataUrls[i];
        });

        // Set fixed 2x2 inch square dimensions (50.8mm x 50.8mm)
        const imageSize = 50.8; // 2 inches in mm
        const imageWidth = imageSize;
        const imageHeight = imageSize;

        // Calculate column position and center image within column
        const columnIndex = i;
        const columnStart = sideMargin + (columnIndex * (columnWidth + columnGap));
        const xOffset = columnStart + (columnWidth - imageWidth) / 2; // Center image in column

        // Position image starting from 3/8 inch from bottom (images extend upward)
        const yOffset = pdfHeight - bottomPadding - imageHeight;

        // Process 700x700 square images
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;

        // Draw the 700x700 image directly (no cropping needed)
        ctx.drawImage(tempImg, 0, 0);

        // Get the processed image data
        const processedImageData = canvas.toDataURL('image/png', 1.0);

        // Add image to PDF
        pdf.addImage(
          processedImageData,
          'PNG',
          xOffset,
          yOffset,
          imageWidth,
          imageHeight
        );
      }
      
      // Convert PDF to blob for download and drag & drop
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      
      // Auto-download the PDF - first save the blob reference, then download it
      const currentPdfBlob = pdfBlob;
      setTimeout(() => {
        if (currentPdfBlob) {
          const url = URL.createObjectURL(currentPdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = pdfFileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }
      }, 500);
      
      // Auto-delete images after PDF generation is complete
      clearSelectedImages();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="converter-container">
      <img 
        src={process.env.PUBLIC_URL + "/mozeus-logo.webp"}
        alt="Logo" 
        className="logo"
      />
      <h1 className="page-title">Image to PDF Converter</h1>
      
      {/* Selection Mode */}
      {showSelectionMode ? (
        <div>
          <div className="selection-header">
            <h2 className="selection-title">
              Select exactly 3 images ({selectedFiles.length}/3)
            </h2>
            <div className="btn-container">
              <button 
                onClick={confirmSelection}
                disabled={selectedFiles.length !== 3}
                className={`btn ${selectedFiles.length === 9 ? 'btn-success' : 'btn-primary'}`}
                style={{opacity: selectedFiles.length !== 3 ? 0.5 : 1}}
              >
                <Check size={16} style={{marginRight: '4px'}} /> Confirm Selection
              </button>
              <button 
                onClick={cancelSelection}
                className="btn btn-danger"
              >
                <X size={16} style={{marginRight: '4px'}} /> Cancel
              </button>
            </div>
          </div>
          
          <div className="images-grid">
            {availableImages.map((image, index) => (
              <div 
                key={index}
                className={`image-card ${isImageSelected(image) ? 'selected' : ''}`}
                onClick={() => toggleImageSelection(image)}
              >
                <img 
                  src={URL.createObjectURL(image)} 
                  alt={`Available ${index}`} 
                  className="image-preview" 
                />
                {isImageSelected(image) && (
                  <div className="selection-mark">
                    <Check size={16} />
                  </div>
                )}
                <div className="image-name">{image.name}</div>
              </div>
            ))}
          </div>
          
          {selectedFiles.length > 3 && (
            <p className="alert-danger">
              Please select exactly 3 images. You've selected {selectedFiles.length} images.
            </p>
          )}
          
          {selectedFiles.length < 3 && (
            <p className="alert-warning">
              Please select {3 - selectedFiles.length} more images.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* File Selection Options */}
          <div className="file-selection">
            <button
              onClick={selectNineImages}
              className="btn btn-primary"
              style={{display: 'flex', alignItems: 'center', padding: '12px 24px', fontSize: '18px'}}
            >
              Select 3 Images
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect} 
              multiple 
              accept="image/*" 
              style={{display: 'none'}} 
            />
          </div>
          
          {/* Auto-Delete Success Message */}
          {autoDeleteSuccess && (
            <div className="success-message">
              <Check size={16} className="success-icon" />
              <span>Images automatically cleared after PDF creation</span>
            </div>
          )}
          
          {/* File Drop Zone */}
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="drop-zone-icon" />
            <p className="drop-zone-text">Drag and drop images here, or click to select</p>
            <p className="drop-zone-subtext">(Maximum 3 images)</p>
          </div>
          
          {/* Selected Images Preview */}
          {selectedFiles.length > 0 && (
            <div className="selected-images">
              <h2 className="selected-images-title">Selected Images ({selectedFiles.length}/3 columns)</h2>
              <div className="selected-grid">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="selected-image-card">
                    <div className="image-container">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`} 
                        className="selected-image"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="delete-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="image-name">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Generate PDF Button */}
          <div className="generate-btn-container">
            <button 
              onClick={generatePDF}
              disabled={selectedFiles.length === 0 || isGenerating}
              className="btn btn-primary"
              style={{opacity: selectedFiles.length === 0 || isGenerating ? 0.5 : 1}}
            >
              {isGenerating ? 'Generating...' : 'Generate PDF (210mm × 148mm)'}
            </button>
          </div>
          
        </>
      )}
    </div>
  );
}