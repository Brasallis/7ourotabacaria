import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (file: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageFile) {
        onCropComplete(croppedImageFile);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao cortar a imagem.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ position: 'relative', width: '90vw', height: '60vh', maxWidth: '500px', backgroundColor: '#222', borderRadius: '12px', overflow: 'hidden' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          minZoom={0.1}
          restrictPosition={false}
          aspect={1} /* 1:1 Aspect Ratio (Quadrado, padrão de perfis) */
          onCropChange={onCropChange}
          onCropComplete={handleCropComplete}
          onZoomChange={onZoomChange}
        />
      </div>
      
      <div style={{ marginTop: '20px', width: '90vw', maxWidth: '500px' }}>
        <input 
          type="range" 
          min={0.1} 
          max={3} 
          step={0.1} 
          value={zoom} 
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: '100%', marginBottom: '20px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ backgroundColor: '#fff', color: '#000', borderColor: '#fff' }}>
          Cancelar
        </button>
        <button type="button" onClick={handleSave} className="btn-primary">
          Confirmar Corte
        </button>
      </div>
    </div>
  );
}
