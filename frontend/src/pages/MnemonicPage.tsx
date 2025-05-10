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

            <div className="disease-entry">
                <h2>喘证</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">实喘</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风寒壅肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">宣肺散寒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">麻黄汤合华盖散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">表寒肺热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">解表清里，化痰平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">麻杏石甘汤加味</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰热郁肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热化痰，宣肺平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桑白皮汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊阻肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛痰降逆，宣肺平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">二陈汤合三子养亲汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺气郁痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">开郁降气平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">五磨饮子</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">虚喘</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺气虚耗</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肺益气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">生脉散合补肺汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾虚不纳</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肾纳气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">金匮肾气丸合参蛤散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">正虚喘脱</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">扶阳固脱，镇摄肾气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参附汤送服黑锡丹配蛤蚧粉</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">实喘：风寒热肺浊气闭，</span><br />
                        <span className="reveal-text">麻盖麻桑二亲五。</span><br />
                        <span className="reveal-text">虚喘：肺虚补肺脉，</span><br />
                        <span className="reveal-text">肾虚肾金蛤，</span><br />
                        <span className="reveal-text">喘脱黑参附。</span>
                    </p>
                </div>
            </div>

            <div className="disease-entry">
                <h2>肺痨</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">肺痨</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺阴亏损</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴润肺</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">月华丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">虚火灼肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">百合固金汤合秦艽鳖甲散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气阴耗伤</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养阴</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">保真汤或参苓白术散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴阳两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴补阳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">补天大造丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">月阴火百合黛蛤，</span><br />
                        <span className="reveal-text">气阴保参补补阳。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>肺胀</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">肺胀</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">外寒里饮</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温肺散寒，化痰降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">小青龙汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊壅肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化痰降气，健脾益肺</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">苏子降气汤合三子养亲汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰热郁肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肺化痰，降逆平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">越婢加半夏汤或桑白皮汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰蒙神窍</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">涤痰，开窍，息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">涤痰汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阳虚水泛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温肾健脾，化饮利水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">真武汤合五苓散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺肾气虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肺纳肾，降气平喘</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">平喘固本汤合补肺汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">苏三痰浊热桑越，</span><br />
                        <span className="reveal-text">平补肺肾真五阳，</span><br />
                        <span className="reveal-text">痰蒙神窍涤痰汤。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>心悸</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">心悸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心虚胆怯</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">镇惊定志，养心安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">安神定志丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心血不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补血养心，益气安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心阳不振</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补心阳，安神定悸</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桂枝甘草龙骨牡蛎汤合参附汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">水饮凌心</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">振奋心阳，化气行水，宁心安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">苓桂术甘汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚火旺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴清火，养心安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天王补心丹合朱砂安神丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀阻心脉</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，理气通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桃仁红花煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰火扰心</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热化痰，宁心安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连温胆汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">心悸胆怯安血归</span><br />
                        <span className="reveal-text">参附桂阳阴天朱</span><br />
                        <span className="reveal-text">瘀阻桃红饮苓术</span><br />
                        <span className="reveal-text">痰火黄连温胆汤。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>胸痹</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">胸痹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心血瘀阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，通脉止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">血府逐瘀汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气滞心胸</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝理气，活血通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">柴胡疏肝散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊闭阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">通阳泄浊，豁痰宣痹</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">瓜蒌薤白半夏汤合涤痰汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒凝心脉</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">辛温散寒，宣通心阳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">枳实薤白桂枝汤合当归四逆汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气阴两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养阴，活血通脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">生脉散合人参养荣汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心肾阴虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴清火，养心和络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天王补心丹合炙甘草汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心肾阳虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补阳气，振奋心阳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参附汤合右归饮</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">实证:半夏瓜蒌涤痰浊，</span><br />
                        <span className="reveal-text">当归四逆枳桂寒，</span><br />
                        <span className="reveal-text">心瘀血府柴气滞。</span><br />
                        <span className="reveal-text">虚证:人生气阴阳参右，</span><br />
                        <span className="reveal-text">天王甘草心肾阴。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>不寐</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">不寐</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火扰心</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝泻火，镇心安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰热扰心</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清化痰热，和中安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连温胆汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心脾两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补益心脾，养血安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心肾不交</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火，交通心肾</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六味地黄丸合交泰丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心胆气虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气镇惊，安神定志</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">安神定志丸合酸枣仁汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">不寐泻肝痰热黄</span><br />
                        <span className="reveal-text">六交心肾胆安酸</span><br />
                        <span className="reveal-text">心脾两虚归脾养。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痫病</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">发作期</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阳痫</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">急以开窍醒神，继以泻热涤痰息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连解毒汤合定痫丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴痫</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">急以开窍醒神，继以温化痰痫，顺气定痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">五生饮、二陈汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">休止期</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火痰热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻火，化痰宁心</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤合涤痰汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾虚痰盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾化痰</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六君子汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝肾阴虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋养肝肾，填精益髓</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大补元煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀阻脑络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，息风通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">通窍活血汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">定痫黄连治阳痫</span><br />
                        <span className="reveal-text">阴痫五生二陈连六君脾虚瘀通窍</span><br />
                        <span className="reveal-text">肝火涤龙阴补元</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>胃痛</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">胃痛</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒邪客胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温胃散寒，行气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">香苏散合良附丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">饮食伤胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">消食导滞，和胃止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">保和丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝气犯胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝解郁，理气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">柴胡疏肝散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝胃郁热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝泄热，和胃止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">化肝煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热中阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清化湿热，理气和胃</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">清中汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血停滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化瘀通络，理气和胃</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">失笑散合丹参饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃阴不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养阴益胃，和中止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">益胃汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾胃虚寒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中健脾，和胃止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄芪建中汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">胃痛寒食瘀肝犯</span><br />
                        <span className="reveal-text">湿热阴亏脾胃寒</span><br />
                        <span className="reveal-text">良和丹参笑柴胡</span><br />
                        <span className="reveal-text">清中益胃黄芪中</span><br />
                        <span className="reveal-text">肝胃郁热化肝煎</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>呕吐</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">呕吐</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">外邪犯胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏邪解表，化浊和中</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">藿香正气散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">食滞内停</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">消食化滞，和胃降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">保和丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰饮中阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中化饮，和胃降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">小半夏汤合苓桂术甘汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝气犯胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝理气，和胃降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">半夏厚朴汤合左金丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾胃虚寒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中健脾，和胃降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">理中汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃阴不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋养胃阴，降逆止呕</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">麦门冬汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">呕吐邪食藿香保</span><br />
                        <span className="reveal-text">小苓痰饮半金肝</span><br />
                        <span className="reveal-text">理脾胃寒胃阴麦</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>腹痛</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">腹痛</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒邪内阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">散寒温里，理气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">良附丸合正气天香散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热壅滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">泄热通腑，行气导滞</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大承气汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">饮食积滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">消食导滞，理气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">枳实导滞丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝郁气滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝解郁，理气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">柴胡疏肝散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血内停</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，和络止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">少腹逐瘀汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">中虚脏寒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中补虚，缓急止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">小建中汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">寒热食肝瘀脏寒</span><br />
                        <span className="reveal-text">良气承枳柴少建</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>泄泻</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">泄泻</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒湿内盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">芳香化湿，解表散寒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">藿香正气散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热中阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，分利止泻</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">葛根芩连汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">食滞肠胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">消食导滞，和中止泻</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">保和丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝气乘脾</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">抑肝扶脾</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">痛泻要方</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾胃虚弱</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾益气，化湿止泻</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参苓白术散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阳虚衰</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温肾健脾，固涩止泻</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">四神丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">暴泻：暴泻寒湿热食滞，</span><br />
                        <span className="reveal-text">藿香葛根芩连保。</span><br />
                        <span className="reveal-text">久泻：脾胃肾衰肝乘脾，</span><br />
                        <span className="reveal-text">参苓四神痛泻方。</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痢疾</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">痢疾</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肠化湿，调气和血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">芍药汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">疫毒痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热解毒，凉血除积</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">白头翁汤合芍药汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒湿痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中燥湿，调气和血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">不换金正气散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养阴和营，清肠化湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连阿胶汤合驻车丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">虚寒痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补脾肾，收涩固脱</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桃花汤合真人养脏汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">休息痢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中清肠，调气化滞</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">连理汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">寒湿热不换芍</span><br />
                        <span className="reveal-text">疫毒白头芍</span><br />
                        <span className="reveal-text">阴虚驻车黄</span><br />
                        <span className="reveal-text">虚寒桃花真</span><br />
                        <span className="reveal-text">休息连理汤</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>便秘</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">便秘</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">泻热导滞，润肠通便</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">麻子仁丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">顺气导滞</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六磨汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">冷秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温里散寒，通便止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大黄附子汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气润肠</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄芪汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血虚秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养血润燥</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">润肠丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴通便</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">增液汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阳虚秘</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温阳通便</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">济川煎</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">便秘实秘冷热气</span><br />
                        <span className="reveal-text">气血阴阳均虚秘</span><br />
                        <span className="reveal-text">大黄附子麻子六</span><br />
                        <span className="reveal-text">黄芪润肠增液济</span>
                    </p>
                </div>
            </div>

        </div>
    );
}
