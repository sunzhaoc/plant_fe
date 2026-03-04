import styles from 'src/components/Layout/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            {/* 顶部优势信任栏 */}
            <div className={styles.advantageBar}>
                <div className={styles.advantageItem}>
                    <i className={`bi bi-shield-check ${styles.advantageIcon}`}></i>
                    <span>正品珍稀植物 人工培育</span>
                </div>
                <div className={styles.advantageItem}>
                    <i className={`bi bi-truck ${styles.advantageIcon}`}></i>
                    <span>全程顺丰配送 开箱包活</span>
                </div>
                <div className={styles.advantageItem}>
                    <i className={`bi bi-arrow-counterclockwise ${styles.advantageIcon}`}></i>
                    <span>专属售后群 售后保障</span>
                </div>
                <div className={styles.advantageItem}>
                    <i className={`bi bi-chat-square-heart ${styles.advantageIcon}`}></i>
                    <span>1v1专属养护 终身指导</span>
                </div>
            </div>

            {/* 核心内容容器 */}
            <div className={styles.container}>
                {/* 品牌介绍模块 */}
                <div className={styles.brandBlock}>
                    <p className={styles.brandDesc}>
                        专注于珍稀植物的培育与销售 严选全球优质品种，提供专业养护全流程服务，让每一位玩家都能养好植物
                    </p>
                </div>

                {/* 底部版权与合规区 */}
                <div className={styles.copyrightBlock}>
                    <div className={styles.policyLinks}>
                        <a href="#" className={styles.policyLink}>隐私政策</a>
                        <a href="#" className={styles.policyLink}>服务条款</a>
                        <a href="#" className={styles.policyLink}>免责声明</a>
                        <a href="#" className={styles.policyLink}>Cookie设置</a>
                    </div>
                    {/* 拆分ICP文本，添加专属类名 icpInfo */}
                    <p className={styles.copyrightText}>
                        © 2025 蚁栖植物 (antplant.store) 版权所有
                        <span className={styles.icpInfo}>京ICP备2024076041号</span>
                    </p>
                    <p className={styles.copyrightText}>联系方式：antplant-store@gmail.com</p>
                </div>
            </div>
        </footer>
    );
}