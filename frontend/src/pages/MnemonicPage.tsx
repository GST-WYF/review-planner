import { useEffect } from 'react';
import './MnemonicPage.css'; // 见下文如何处理 CSS

export default function MnemonicPage() {
    useEffect(() => {
        const revealElements = document.querySelectorAll<HTMLElement>('.reveal-text');
        const proximityInput = document.getElementById('proximityRadiusInput') as HTMLInputElement;

        const getCurrentProximityRadius = () => {
            const value = parseInt(proximityInput.value, 10);
            return isNaN(value) || value <= 0 ? 1 : value;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const proximityRadius = getCurrentProximityRadius();

            revealElements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
                const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
                const distance = Math.sqrt(Math.pow(closestX - mouseX, 2) + Math.pow(closestY - mouseY, 2));
                element.style.opacity = distance < proximityRadius ? '1' : '0';
            });
        };

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            const proximityRadius = getCurrentProximityRadius();

            revealElements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const closestX = Math.max(rect.left, Math.min(touchX, rect.right));
                const closestY = Math.max(rect.top, Math.min(touchY, rect.bottom));
                const distance = Math.sqrt(Math.pow(closestX - touchX, 2) + Math.pow(closestY - touchY, 2));
                if (distance < proximityRadius) {
                    element.style.opacity = '1';
                }
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchstart', handleTouchStart);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    return (
        <div className="container">
            <h1>中医药背诵内容</h1>

            <div className="controls">
                <label htmlFor="proximityRadiusInput">鼠标靠近距离 (像素):</label>
                <input type="number" id="proximityRadiusInput" defaultValue="1" min="1" />
            </div>

            {/* 感冒 */}
            <div className="disease-entry">
                <h2>感冒</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">常人感冒</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风寒感冒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">辛温解表</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">荆防达表汤或荆防败毒散</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风热感冒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">辛凉解表</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">银翘散或葱豉桔梗汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">暑湿感冒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清暑祛湿解表</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">新加香薷饮</span></div>

                        <div className="grid-category full-width"><span className="reveal-text">虚体感冒</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">气虚感冒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气解表</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参苏饮</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">阳虚感冒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴解表</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">加减葳蕤汤化裁</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">常人：感冒寒热暑湿齐，荆银葱豉新薷饮。</span><br />
                        <span className="reveal-text">虚体：气虚参苏阴葳蕤。</span>
                    </p>
                </div>
            </div>

            {/* 咳嗽 */}
            <div className="disease-entry">
                <h2>咳嗽</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">外感</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风寒袭肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏风散寒，宣肺止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">三拗汤合止嗽散</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风热犯肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏风清热，宣肺止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桑菊饮</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风燥伤肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏风清肺，润燥止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桑杏汤</span></div>

                        <div className="grid-category full-width"><span className="reveal-text">内伤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">痰湿蕴肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">燥湿化痰，理气止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">二陈平胃散合三子养亲汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">痰热郁肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热肃肺，豁痰止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">清金化痰汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">肝火犯肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻肺，顺气降火</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黛蛤散合加减泻白散</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">肺阴亏耗</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴润肺，化痰止咳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">沙参麦冬汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">咳嗽外感与内伤，</span><br />
                        <span className="reveal-text">外感风寒风热燥。</span><br />
                        <span className="reveal-text">内伤肝火痰湿热，</span><br />
                        <span className="reveal-text">内伤虚证肺阴耗。</span><br />
                        <span className="reveal-text">外感：寒热三止与桑菊，</span><br />
                        <span className="reveal-text">风燥伤肺桑杏汤。</span><br />
                        <span className="reveal-text">内伤：二陈平亲桑白肝，</span><br />
                        <span className="reveal-text">痰热清金沙参汤。</span>
                    </p>
                </div>
            </div>

            {/* 哮病 */}
            <div className="disease-entry">
                <h2>哮病</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">发作期</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">冷哮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">宣肺散寒，化痰平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">射干麻黄汤 或 小青龙汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">热哮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热宣肺，化痰定喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">定喘汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">寒包热哮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">解表散寒，清化痰热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">小青龙加石膏汤 或 厚朴麻黄汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">风痰哮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛风涤痰，降气平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">三子养亲汤加味</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">虚哮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肺纳肾，降气化痰</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">平喘固本汤</span></div>

                        <div className="grid-category full-width"><span className="reveal-text">缓解期</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">脾虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾益气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六君子汤</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">肺虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肺益气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">玉屏风散</span></div>

                        <div className="grid-item pattern-name"><span className="reveal-text">肾虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肾纳气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">金匮肾气丸合七位都气丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">发作期：冷射小，热定喘，</span><br />
                        <span className="reveal-text">寒包热，小石厚，</span><br />
                        <span className="reveal-text">风三子，虚平苏。</span><br />
                        <span className="reveal-text">缓解期：缓解肺脾玉屏六，</span><br />
                        <span className="reveal-text">肾虚金匮合都气。</span>
                    </p>
                </div>
            </div>

        </div>
    );
}
