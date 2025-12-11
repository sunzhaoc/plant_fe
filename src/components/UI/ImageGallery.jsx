import {useState} from 'react';

export default function ImageGallery({images}) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="mb-4">
            <div className="mb-3">
                <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="plant-detail-img w-100"
                />
            </div>
            <div className="d-flex gap-2">
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail-img ${selectedImage === img ? 'active' : ''}`}
                        onClick={() => setSelectedImage(img)}
                    />
                ))}
            </div>
        </div>
    );
}