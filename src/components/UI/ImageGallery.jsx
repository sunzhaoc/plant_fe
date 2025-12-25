import {useEffect, useState} from 'react';
import {plantApi, plantImageApi} from "/src/services/api.jsx";

const DEFAULT_PLANT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg==';


export default function ImageGallery({imgUrls}) {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loadImages = async () => {
            // console.log(imgUrls);
            setLoading(true);
            if (!imgUrls || imgUrls.length === 0) {
                setImages([DEFAULT_PLANT_IMAGE]);
                setSelectedImage(DEFAULT_PLANT_IMAGE);
                setLoading(false);
                return;
            }
            const urls = await Promise.all(
                imgUrls.map(_ => plantImageApi.getPlantImage(_.img_url + '?image_process=resize,h_10'))
            );
            setImages(urls);
            if (urls.length > 0) {
                setSelectedImage(urls[0]);
            }
            setLoading(false);
        };

        loadImages();
    }, [imgUrls]);

    if (loading) {
        return <div className="text-center py-5">加载图片中...</div>;
    }

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