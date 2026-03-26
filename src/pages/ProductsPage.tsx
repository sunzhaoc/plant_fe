import React, {useState, useEffect} from 'react';
import styles from './PlantManagement.module.css';
import api from "src/utils/api.tsx";
import toast from "react-hot-toast";
import DBCachedImage from 'src/components/UI/DBCachedImage';

interface OSSPolicy {
    securityToken: string;
    accessKeySecret: string;
    accessKeyId: string;
    policy: string;
    signature: string;
    dir: string;
    host: string;
    expire: number;
}

// 基础类型定义
interface Plant {
    plantId: number;
    plantName: string;
    plantLatinName: string;
    plantMainImgUrl: string | null;
    plantMinPrice: number;
    plantStock: number;
    plantIsOnSale: boolean;
    plantDetail: string;
}

interface PlantImage {
    imageId: number;
    plantId: number;
    imgUrl: string;
    sort: number;
    createTime?: string;
    updateTime?: string;
}

// 本地选择的未上传图片类型
interface LocalImage {
    tempId: number; // 临时ID（用于删除）
    file: File; // 图片文件对象
    previewUrl: string; // 本地预览URL
    sort: number; // 排序
}

// 拖拽图片联合类型
interface DraggableUploadedImage {
    type: 'uploaded';
    id: number;
    imgUrl: string;
    sort: number;
    imageId: number;
}

interface DraggableLocalImage {
    type: 'local';
    id: number;
    imgUrl: string;
    sort: number;
    tempId: number;
    file: File;
    previewUrl: string;
}

type DraggableImage = DraggableUploadedImage | DraggableLocalImage;

interface PlantSku {
    skuId: number;
    size: string;
    price: number;
    stock: number;
    sort: number;
}

interface PlantFormState {
    plantId: number;
    plantName: string;
    plantLatinName: string;
    plantIsOnSale: boolean;
    plantDetail: string;
    plantSkus: PlantSku[];
    plantImages: PlantImage[]; // 已上传到OSS的图片（编辑场景）
    localImages: LocalImage[]; // 本地选择的未上传图片
    mainImgUrl: string | null;
}

const PlantManagement: React.FC = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [currentPlant, setCurrentPlant] = useState<PlantFormState>({
        plantId: -1,
        plantName: '',
        plantLatinName: '',
        plantIsOnSale: false,
        plantDetail: '',
        plantSkus: [],
        plantImages: [],
        localImages: [],
        mainImgUrl: null
    });

    // 请求全量植物列表数据
    const fetchPlants = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/plant-manage/plants');
            console.log("原始接口数据：", response?.data);
            const renamedPlants = response?.data?.data.map((item: any) => ({
                plantId: item.plant_id,
                plantName: item.name,
                plantLatinName: item.latin_name,
                plantMainImgUrl: item.main_img_url,
                plantMinPrice: item.min_price,
                plantStock: item.stock,
                plantIsOnSale: item.is_on_sale === "1",
            }));
            setPlants(renamedPlants || []);
            setError(null);
        } catch (err) {
            console.error("获取植物列表失败：", err);
            setError('获取植物列表失败，请刷新重试');
            setPlants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    // 新增：组件卸载时释放本地预览URL（避免内存泄漏）
    useEffect(() => {
        return () => {
            currentPlant.localImages.forEach(img => {
                URL.revokeObjectURL(img.previewUrl);
            });
        };
    }, [currentPlant.localImages]);

    // 合并已上传和本地图片为可拖拽列表
    const getMergedDraggableImages = (): DraggableImage[] => {
        const uploadedImages: DraggableUploadedImage[] = currentPlant.plantImages.map(img => ({
            type: 'uploaded',
            id: img.imageId,
            imgUrl: img.imgUrl,
            sort: img.sort,
            imageId: img.imageId
        }));

        const localImages: DraggableLocalImage[] = currentPlant.localImages.map(img => ({
            type: 'local',
            id: img.tempId,
            imgUrl: img.previewUrl,
            sort: img.sort,
            tempId: img.tempId,
            file: img.file,
            previewUrl: img.previewUrl
        }));

        // 合并并按sort排序
        return [...uploadedImages, ...localImages].sort((a, b) => a.sort - b.sort);
    };

    // 拖拽开始处理
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: DraggableImage) => {
        e.dataTransfer.setData('draggableImage', JSON.stringify(image));
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.zIndex = '10';
    };

    // 拖拽结束处理
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.zIndex = '1';
    };

    // 拖拽覆盖处理（允许放置）
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // 拖拽放下处理（核心排序逻辑）
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetImage: DraggableImage) => {
        e.preventDefault();

        const draggedImageStr = e.dataTransfer.getData('draggableImage');
        if (!draggedImageStr) return;

        const draggedImage = JSON.parse(draggedImageStr) as DraggableImage;

        // 拖到自己身上不处理
        if (draggedImage.id === targetImage.id && draggedImage.type === targetImage.type) return;

        // 获取当前合并列表并重新排序
        const mergedImages = getMergedDraggableImages();
        const draggedIndex = mergedImages.findIndex(
            img => img.id === draggedImage.id && img.type === draggedImage.type
        );
        const targetIndex = mergedImages.findIndex(
            img => img.id === targetImage.id && img.type === targetImage.type
        );

        if (draggedIndex === -1 || targetIndex === -1) return;

        // 重新排列数组
        const newMergedImages = [...mergedImages];
        newMergedImages.splice(draggedIndex, 1);
        newMergedImages.splice(targetIndex, 0, draggedImage);

        // 更新所有图片的sort字段
        const sortedImages = newMergedImages.map((img, index) => ({...img, sort: index}));

        // 分离已上传和本地图片
        const updatedUploadedImages = sortedImages
            .filter(img => img.type === 'uploaded')
            .map(img => ({
                imageId: (img as DraggableUploadedImage).imageId,
                imgUrl: img.imgUrl,
                sort: img.sort,
                plantId: currentPlant.plantId
            }));

        const updatedLocalImages = sortedImages
            .filter(img => img.type === 'local')
            .map(img => ({
                tempId: (img as DraggableLocalImage).tempId,
                file: (img as DraggableLocalImage).file,
                previewUrl: (img as DraggableLocalImage).previewUrl,
                sort: img.sort
            }));

        // 更新主图（排序第一的图片）
        const newMainImgUrl = sortedImages.length > 0 ? sortedImages[0].imgUrl : null;

        // 更新状态
        setCurrentPlant(prev => ({
            ...prev,
            plantImages: updatedUploadedImages,
            localImages: updatedLocalImages,
            mainImgUrl: newMainImgUrl
        }));
    };

    // 打开新增/编辑模态框
    const handleOpenModal = async (plant?: Plant) => {
        setLoading(true);
        try {
            if (plant) {
                const response = await api.get(`/api/plant/plant-manage/get-plant-detail/${plant.plantId}`);
                const responseData = response?.data?.data || {};
                console.log("接口原始的植物详情为：", responseData);
                const newPlantState: PlantFormState = {
                    plantId: plant.plantId,
                    plantName: responseData.plant_name || plant.plantName,
                    plantLatinName: responseData.plant_latin_name || plant.plantLatinName,
                    plantIsOnSale: plant.plantIsOnSale,
                    plantDetail: responseData.plant_detail || '',
                    plantSkus: (responseData.skus || []).map((sku: any, index: number) => ({
                        skuId: sku.sku_id,
                        size: sku.size || '',
                        price: sku.price || 0,
                        stock: sku.stock || 0,
                        sort: sku.sort || index,
                    })),
                    plantImages: (responseData.images || []).map((image: any) => ({
                        imageId: image.image_id,
                        imgUrl: image.img_url || '',
                        sort: image.sort,
                        plantId: plant.plantId
                    })),
                    localImages: [],
                    mainImgUrl: (responseData.images || []).find((image: any) => !!image?.img_url)?.img_url || null,
                };
                setCurrentPlant(newPlantState);
            } else {
                setCurrentPlant({
                    plantId: -1,
                    plantName: '',
                    plantLatinName: '',
                    plantIsOnSale: true,
                    plantDetail: '',
                    plantSkus: [],
                    plantImages: [],
                    localImages: [],
                    mainImgUrl: null
                });
            }
            setShowModal(true);
        } catch (err) {
            console.error('获取植物详情失败:', err);
            toast.error('获取植物详情失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    // 新增SKU（逻辑不变，兜底sort）
    const handleAddSku = () => {
        setCurrentPlant(prev => ({
            ...prev,
            plantSkus: [
                ...prev.plantSkus,
                {
                    skuId: Date.now(),
                    size: '',
                    price: 0,
                    stock: 0,
                    sort: prev.plantSkus.length || 0
                }
            ]
        }));
    };

    // 删除SKU（增强校验，确保skuId不为undefined）
    const handleDeleteSku = (skuId: number | undefined) => {
        if (skuId === undefined || typeof skuId !== 'number' || isNaN(skuId) || skuId <= 0) {
            toast.error('删除失败：无效的SKU ID');
            console.warn('删除SKU参数错误：', skuId);
            return;
        }

        setCurrentPlant(prevState => {
            const originalSkus = prevState.plantSkus || [];
            const skuExists = originalSkus.some(sku => sku.skuId === skuId);

            if (!skuExists) {
                toast.error('删除失败：未找到该SKU');
                console.warn(`未找到skuId=${skuId}的SKU`);
                return prevState;
            }

            const updatedSkus = originalSkus
                .filter(sku => sku.skuId !== skuId)
                .map((sku, index) => ({...sku, sort: index}));

            toast.success('SKU删除成功');
            console.log(`成功删除skuId=${skuId}的SKU，剩余SKU数量：${updatedSkus.length}`);

            return {...prevState, plantSkus: updatedSkus};
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newLocalImages: LocalImage[] = [];
            const currentSort = getMergedDraggableImages().length;

            Array.from(files).forEach((file, index) => {
                const previewUrl = URL.createObjectURL(file);
                newLocalImages.push({
                    tempId: Date.now() + index,
                    file,
                    previewUrl,
                    sort: currentSort + index,
                });
            });

            // 更新本地图片状态
            setCurrentPlant(prev => {
                const updatedLocalImages = [...prev.localImages, ...newLocalImages];
                // 自动设置第一张图片为主图（如果还没有主图）
                const newMainImgUrl = prev.mainImgUrl || (updatedLocalImages.length > 0 ? updatedLocalImages[0].previewUrl : null);

                return {
                    ...prev,
                    localImages: updatedLocalImages,
                    mainImgUrl: newMainImgUrl
                };
            });

            e.target.value = '';
        }
    };

    // 新增：删除本地选择的未上传图片
    const handleDeleteLocalImage = (tempId: number) => {
        setCurrentPlant(prev => {
            const newLocalImages = prev.localImages.filter(img => img.tempId !== tempId);
            // 释放预览URL内存
            const deletedImg = prev.localImages.find(img => img.tempId === tempId);
            if (deletedImg) URL.revokeObjectURL(deletedImg.previewUrl);

            // 重新计算sort
            const reindexedLocalImages = newLocalImages.map((img, index) => ({
                ...img,
                sort: getMergedDraggableImages().filter(img => img.type === 'uploaded').length + index
            }));

            // 更新主图
            let newMainImgUrl = prev.mainImgUrl;
            if (deletedImg?.previewUrl === newMainImgUrl) {
                const mergedImages = getMergedDraggableImages().filter(img => img.id !== tempId);
                newMainImgUrl = mergedImages.length > 0 ? mergedImages[0].imgUrl : null;
            }

            return {
                ...prev,
                localImages: reindexedLocalImages,
                mainImgUrl: newMainImgUrl,
            };
        });
    };

    // 新增：删除已上传到OSS的图片
    const handleDeleteUploadedImage = (imageId: number) => {
        setCurrentPlant(prev => {
            const newPlantImages = prev.plantImages.filter(img => img.imageId !== imageId);

            // 重新计算sort
            const reindexedUploadedImages = newPlantImages.map((img, index) => ({
                ...img,
                sort: index
            }));

            // 更新主图
            let newMainImgUrl = prev.mainImgUrl;
            const deletedImg = prev.plantImages.find(img => img.imageId === imageId);
            if (deletedImg?.imgUrl === newMainImgUrl) {
                const mergedImages = getMergedDraggableImages().filter(img => img.id !== imageId);
                newMainImgUrl = mergedImages.length > 0 ? mergedImages[0].imgUrl : null;
            }

            return {
                ...prev,
                plantImages: reindexedUploadedImages,
                mainImgUrl: newMainImgUrl,
            };
        });
    };

    const getMostFrequentImagePath = (plantImages: PlantImage[]): string => {
        // 找到一个植物下所有的图片中，出现最多的一个路径
        if (!plantImages || plantImages.length === 0) return '';

        // 提取每个图片URL的目录部分（去掉文件名）
        const pathCountMap: Record<string, number> = {};
        plantImages.forEach(img => {
            if (!img.imgUrl) return;
            // 解析URL，获取目录（最后一个/之前的部分）
            const lastSlashIndex = img.imgUrl.lastIndexOf('/');
            const dirPath = lastSlashIndex > -1 ? img.imgUrl.substring(0, lastSlashIndex) : '';
            if (dirPath) {
                pathCountMap[dirPath] = (pathCountMap[dirPath] || 0) + 1;
            }
        });

        // 找到出现次数最多的路径
        let maxCount = 0;
        let mostFrequentPath = '';
        Object.entries(pathCountMap).forEach(([path, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentPath = path;
            }
        });

        return mostFrequentPath;
    };

    const generatePathFromLatinName = (latinName: string): string => {
        if (!latinName || latinName.trim() === '') {
            throw new Error('拉丁学名不能为空，无法生成图片路径');
        }

        // 步骤1：清洗拉丁学名，只保留数字、小写字母和下划线，去除连续下划线
        const cleanedName = latinName
            .toLowerCase() // 转小写
            .replace(/[^a-z0-9]/g, '_') // 移除非字母数字的字符，替换为下划线
            .replace(/_+/g, '_') // 连续下划线替换为单个
            .replace(/^_+|_+$/g, ''); // 移除首尾下划线

        // 步骤2：提取属名（第一个单词）
        const genusName = cleanedName.split('_')[0] || '';
        if (!genusName) {
            throw new Error('拉丁学名格式异常，无法提取属名');
        }

        // 步骤3：拼接最终路径（/属名/清洗后的全名）
        return `plant/${genusName}/${cleanedName}`;
    };

    // 保存植物信息
    const handleSavePlant = async () => {
        if (!currentPlant.plantName.trim()) {
            toast.error('请填写植物名称');
            return;
        }
        if (currentPlant.plantSkus.length === 0) {
            toast.error('请至少添加一个SKU规格');
            return;
        }

        try {
            // ===================== 步骤1：确定OSS目标路径 =====================
            let targetOssPath = '';
            // 有已上传的OSS图片：取出现次数最多的路径
            if (currentPlant.plantImages && currentPlant.plantImages.length > 0) {
                targetOssPath = getMostFrequentImagePath(currentPlant.plantImages);
                if (!targetOssPath) {
                    targetOssPath = generatePathFromLatinName(currentPlant.plantLatinName);
                }
            } else {
                // 无已上传图片：根据拉丁学名生成路径
                targetOssPath = generatePathFromLatinName(currentPlant.plantLatinName);
            }
            console.log('最终OSS目标路径：', targetOssPath);

            // ===================== 步骤2：获取OSS上传签名凭证 =====================
            const policyRes = await api.get('/api/plant/plant-manage/get-upload-policy');
            const ossPolicy: OSSPolicy = policyRes?.data?.data;
            if (!ossPolicy) {
                throw new Error('获取OSS上传凭证失败');
            }

            // ===================== 步骤3：上传本地图片到OSS（按排序顺序） =====================
            const uploadedImageList: { url: string; sort: number }[] = [];
            // 按sort排序上传本地图片
            const sortedLocalImages = [...currentPlant.localImages].sort((a, b) => a.sort - b.sort);

            for (const localImg of sortedLocalImages) {
                const {file} = localImg;
                const originalFileName = file.name || '';
                const ext = originalFileName.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

                const ossKey = `${targetOssPath.replace(/\/$/, '')}/${fileName}`.replace(/\/\/+/, '/');

                const formData = new FormData();
                formData.append('key', ossKey);
                formData.append('policy', ossPolicy.policy);
                formData.append('OSSAccessKeyId', ossPolicy.accessKeyId);
                formData.append('signature', ossPolicy.signature);
                if (ossPolicy.securityToken) {
                    formData.append('x-oss-security-token', ossPolicy.securityToken);
                }
                formData.append('file', file);

                console.log("上传参数验证：", {
                    key: `${ossPolicy.dir}/${fileName}`,
                    OSSAccessKeyId: ossPolicy.accessKeyId,
                    securityToken: ossPolicy.securityToken,
                    host: ossPolicy.host
                });

                await api.post(ossPolicy.host, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: false,
                });

                uploadedImageList.push({url: ossKey, sort: localImg.sort});
            }
            console.log("已上传的图片 LIST（按排序）：", uploadedImageList);

            // ===================== 步骤4：构造最终图片列表（合并+排序） =====================
            const finalImages = [
                // 已上传图片
                ...currentPlant.plantImages.map(img => ({url: img.imgUrl, sort: img.sort})),
                // 新上传图片
                ...uploadedImageList
            ].sort((a, b) => a.sort - b.sort)
                .map((img, index) => ({
                    img_url: img.url,
                    sort: index // 最终按拖拽顺序重新赋值sort
                }));
            console.log("最终上传的图片 LIST 为：", finalImages);
            // ===================== 步骤5：提交植物数据到后端 =====================
            const plantData = {
                id: currentPlant.plantId,
                name: currentPlant.plantName,
                latinName: currentPlant.plantLatinName,
                isOnSale: !!currentPlant.plantIsOnSale,
                detail: currentPlant.plantDetail,
                skus: currentPlant.plantSkus,
                images: finalImages, // 按拖拽排序后的图片列表
                main_img_url: currentPlant.mainImgUrl // 主图URL
            };

            await api.post('/api/plant/plant-manage/save-plant', plantData);
            toast.success('保存成功');
            fetchPlants();
            setShowModal(false);

            // 步骤6：释放本地预览URL内存
            currentPlant.localImages.forEach(img => {
                URL.revokeObjectURL(img.previewUrl);
            });

        } catch (err) {
            console.error('保存植物失败:', err);
            toast.error('保存失败，请重试');
            toast.dismiss('upload');
        }
    };


    // 加载/错误状态
    if (loading && !showModal) {
        return <div className={styles.loading}>加载中...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                {error}
                <button onClick={fetchPlants} className={styles.btn}>刷新</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>植物商品管理</h2>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleOpenModal()}>
                    新增植物
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.plantTable}>
                    <thead>
                    <tr>
                        <th>拉丁学名</th>
                        <th>商品名称</th>
                        <th>最低价格</th>
                        <th>库存</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {plants.length === 0 ? (
                        <tr>
                            <td colSpan={6} className={styles.empty}>暂无植物数据</td>
                        </tr>
                    ) : (
                        plants.map(plant => (
                            <tr key={plant.plantId}>
                                <td>{plant.plantLatinName}</td>
                                <td>{plant.plantName}</td>
                                <td>¥{plant.plantMinPrice}</td>
                                <td>{plant.plantStock}</td>
                                <td>
                                    <span
                                        className={`${styles.badge} ${plant.plantIsOnSale ? styles.badgePrimary : styles.badgeSecondary}`}
                                    >
                                        {plant.plantIsOnSale ? '已上架' : '已下架'}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.btnGroup}>
                                        <button
                                            className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                                            onClick={() => handleOpenModal(plant)}
                                        >
                                            编辑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>{currentPlant.plantId ? '编辑植物' : '新增植物'}</h5>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formRow}>
                                <div className={styles.formCol}>
                                    <h6 style={{marginBottom: '16px', color: '#1f2937'}}>基础信息</h6>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>中文名 *</label>
                                        <input
                                            type="text"
                                            className={styles.formControl}
                                            value={currentPlant.plantName}
                                            onChange={(e) => setCurrentPlant({
                                                ...currentPlant,
                                                plantName: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>拉丁学名 *</label>
                                        <input
                                            type="text"
                                            className={styles.formControl}
                                            value={currentPlant.plantLatinName}
                                            onChange={(e) => setCurrentPlant({
                                                ...currentPlant,
                                                plantLatinName: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <input
                                                type="checkbox"
                                                checked={currentPlant.plantIsOnSale}
                                                onChange={(e) => setCurrentPlant({
                                                    ...currentPlant,
                                                    plantIsOnSale: e.target.checked
                                                })}
                                                style={{marginRight: '8px'}}
                                            />
                                            上架状态
                                        </label>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>商品介绍</label>
                                        <textarea
                                            className={styles.formControl}
                                            rows={6}
                                            value={currentPlant.plantDetail}
                                            onChange={(e) => setCurrentPlant({
                                                ...currentPlant,
                                                plantDetail: e.target.value
                                            })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className={styles.formCol}>
                                    <h6
                                        style={{
                                            marginBottom: '16px',
                                            color: '#1f2937'
                                        }}>图片管理（拖拽可排序，首张为封面）</h6>
                                    <div className={styles.uploadArea}>
                                        <input
                                            type="file"
                                            className={styles.formControl}
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                        />

                                        <div className={styles.imagePreview}>
                                            {/* 渲染混合拖拽图片列表 */}
                                            {getMergedDraggableImages().map((img) => (
                                                <div
                                                    key={`${img.type}-${img.id}`}
                                                    className={styles.imageItem}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, img)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, img)}
                                                    style={{
                                                        cursor: 'grab',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {img.type === 'uploaded' ? (
                                                        <DBCachedImage
                                                            url={img.imgUrl}
                                                            params="?image_process=resize,h_86"
                                                            alt={`${currentPlant.plantName}-${img.sort}`}
                                                            className="plantCardImg"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={img.previewUrl}
                                                            alt={`${currentPlant.plantName}-${img.sort}`}
                                                            className="plantCardImg"
                                                            style={{width: '86px', height: '86px', objectFit: 'cover'}}
                                                        />
                                                    )}
                                                    <button
                                                        className={styles.imageDelete}
                                                        onClick={() => {
                                                            if (img.type === 'uploaded') {
                                                                handleDeleteUploadedImage(img.imageId);
                                                            } else {
                                                                handleDeleteLocalImage(img.tempId);
                                                            }
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                    {img.imgUrl === currentPlant.mainImgUrl && (
                                                        <span
                                                            className={`${styles.badge} ${styles.badgePrimary} ${styles.imageBadge}`}>主图</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <h6 style={{margin: '24px 0 16px', color: '#1f2937'}}>SKU规格</h6>
                                    <button
                                        className={`${styles.btn} ${styles.btnOutlinePrimary}`}
                                        onClick={handleAddSku}
                                    >
                                        新增规格
                                    </button>
                                    <div className="table-responsive">
                                        <table className={styles.skuTable}>
                                            <thead>
                                            <tr>
                                                <th>规格名称</th>
                                                <th>价格</th>
                                                <th>库存</th>
                                                <th>排序</th>
                                                <th>操作</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {currentPlant.plantSkus.map(sku => (
                                                <tr key={sku.skuId}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className={styles.formControl}
                                                            value={sku.size}
                                                            onChange={(e) => {
                                                                const newSkus = currentPlant.plantSkus.map(s =>
                                                                    s.skuId === sku.skuId ? {
                                                                        ...s,
                                                                        size: e.target.value
                                                                    } : s
                                                                );
                                                                setCurrentPlant({...currentPlant, plantSkus: newSkus});
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={styles.formControl}
                                                            value={sku.price}
                                                            onChange={(e) => {
                                                                const newSkus = currentPlant.plantSkus.map(s =>
                                                                    s.skuId === sku.skuId ? {
                                                                        ...s,
                                                                        price: Number(e.target.value)
                                                                    } : s
                                                                );
                                                                setCurrentPlant({...currentPlant, plantSkus: newSkus});
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={styles.formControl}
                                                            value={sku.stock}
                                                            onChange={(e) => {
                                                                const newSkus = currentPlant.plantSkus.map(s =>
                                                                    s.skuId === sku.skuId ? {
                                                                        ...s,
                                                                        stock: Number(e.target.value)
                                                                    } : s
                                                                );
                                                                setCurrentPlant({...currentPlant, plantSkus: newSkus});
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={styles.formControl}
                                                            value={sku.sort}
                                                            onChange={(e) => {
                                                                const newSkus = currentPlant.plantSkus.map(s =>
                                                                    s.skuId === sku.skuId ? {
                                                                        ...s,
                                                                        sort: Number(e.target.value)
                                                                    } : s
                                                                );
                                                                setCurrentPlant({...currentPlant, plantSkus: newSkus});
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                            onClick={() => handleDeleteSku(sku.skuId)}
                                                        >
                                                            删除
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setShowModal(false)}
                            >
                                取消
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={handleSavePlant}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantManagement;