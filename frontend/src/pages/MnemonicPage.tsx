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
            <div className="disease-entry">
                <h2>胁痛</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">胁痛</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝郁气滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝理气</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">柴胡疏肝散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝胆湿热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血阻络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛瘀通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">血府逐瘀汤或复元活血汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝络失养</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养阴柔肝</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">一贯煎</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">肝郁柴疏湿热泻</span><br />
                        <span className="reveal-text">瘀血血府或复元</span><br />
                        <span className="reveal-text">肝络失养一贯煎</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>黄疸</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">阳黄</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热重于湿</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热通腑，利湿退黄</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">茵陈蒿汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿重于热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化湿利小便，佐以清热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">茵陈五苓散合甘露消毒丹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胆腑郁热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝泄热，利胆退黄</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大柴胡汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">疫毒炽盛（急黄）</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热解毒，凉血开窍</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">犀角地黄汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">阴黄</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒湿阻遏</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温中化湿，健脾和胃</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">茵陈术附汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾虚湿滞</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾和血，利湿退黄</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄芪建中汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">黄疸消退后的调治</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热留恋</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">茵陈四苓散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝脾不调</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">调和肝脾，理气助运</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">柴胡疏肝散或归芍六君子汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气滞血瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝理气，活血化瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">逍遥散合鳖甲煎丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">阳黄:茵五甘露湿热茵</span><br />
                        <span className="reveal-text">胆腑大柴疫毒金</span><br />
                        <span className="reveal-text">阴黄:茵陈术附寒湿阻</span><br />
                        <span className="reveal-text">脾虚湿滞黄芪中</span><br />
                        <span className="reveal-text">后期:热恋不调气血瘀</span><br />
                        <span className="reveal-text">茵四柴归逍鳖甲</span>
                    </p>
                </div>
            </div>

            <div className="disease-entry">
                <h2>头痛</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">外感</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风寒头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏散风寒止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">川芎茶调散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风热头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏风清热和络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">芎芷石膏汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风湿头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛风胜湿通窍</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">羌活胜湿汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">内伤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝阳头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">平肝潜阳息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天麻钩藤饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血虚头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养血滋阴，和络止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">加味四物汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾燥湿，化痰降逆</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">半夏白术天麻汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾虚头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养阴补肾，填精生髓</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大补元煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，通窍止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">通窍活血汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚头痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾益气升清</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">益气聪明汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">外感:头痛外感寒热湿</span><br />
                        <span className="reveal-text">川芎芎芷羌活汤</span><br />
                        <span className="reveal-text">内伤:肝阳痰瘀血虚肾</span><br />
                        <span className="reveal-text">天麻半术通四大</span><br />
                        <span className="reveal-text">气虚益气聪明汤</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>眩晕</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">眩晕</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝阳上亢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">平肝潜阳，清火息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天麻钩藤饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补益气血，调养心脾</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾精不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋养肝肾，益精填髓</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">左归丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊中阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化痰祛湿，健脾和胃</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">半夏白术天麻汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血阻窍</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛瘀生新，活血通窍</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">通窍活血汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">眩晕肝阳痰浊瘀</span><br />
                        <span className="reveal-text">肾精不足气血亏</span><br />
                        <span className="reveal-text">天麻半术通左归</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>中风</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">急性期中经络</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风痰入络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">息风化痰，活血通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">半夏白术天麻汤合桃仁红花煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风阳上扰</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻火，息风潜阳</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天麻钩藤饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚风动</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋养肝肾，潜阳熄风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">镇肝息风汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">急性期中脏腑</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">闭证-阳闭证</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝息风，豁痰开窍</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">羚角钩藤汤，另服至宝丹或安宫牛黄丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">闭证-阴闭证</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化痰息风，宣郁开窍</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">涤痰汤合用苏合香丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脱证（阴竭阳亡）</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">回阳救阴，益气固脱</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参附汤合生脉散加味</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">恢复期和后遗症期</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风痰瘀阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">搜风化痰，行瘀通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">解语丹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚络瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养血，化瘀通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">补阳还五汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝肾亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋养肝肾</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">左归丸合地黄饮子</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">中经络:风痰半桃阴阳镇天</span><br />
                        <span className="reveal-text">中脏腑:阳闭至安羚角汤</span><br />
                        <span className="reveal-text">阴闭涤痰苏合香</span><br />
                        <span className="reveal-text">脱证参附生脉养</span><br />
                        <span className="reveal-text">中风后遗症:痰瘀肝肾气络瘀</span><br />
                        <span className="reveal-text">解语左地补阳五</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>颤证</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">颤证</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风阳内动</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">镇肝息风，舒筋止颤</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天麻钩藤饮合镇肝熄风汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰热风动</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热化痰，平肝息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">导痰汤合羚角钩藤汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养血，濡养筋脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">人参养荣汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">髓海不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">填精补髓，育阴息风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龟鹿二仙膏合大定风珠</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阳气虚衰</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肾助阳，温煦筋脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">地黄饮子</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">天麻镇风痰羚导</span><br />
                        <span className="reveal-text">阳地髓龟定气血荣</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痴呆</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">痴呆</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">髓海不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋补肝肾，填精补髓</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">七福饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾肾亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补脾肾，养元安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">还少丹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气健脾，养血安神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰浊蒙窍</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化痰开窍，健脾醒神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">洗心汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀阻脑络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，通窍醒神</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">通窍活血汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心肝火旺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清心平肝，安神定志</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天麻钩藤饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热毒内盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热解毒，通络达邪</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连解毒汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">七髓洗痰少脾肾</span><br />
                        <span className="reveal-text">瘀血通窍热毒连</span><br />
                        <span className="reveal-text">心肝天麻连</span><br />
                        <span className="reveal-text">气血亏归脾</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>水肿</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">阳水</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风水相搏</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏风清热，宣肺行水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">越婢加术汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿毒浸淫</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">宣肺解毒，利湿消肿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">麻黄连翘赤小豆汤合五味消毒饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">水湿浸渍</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">运脾化湿，通阳利水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">五皮饮合胃苓汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热壅盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">分利湿热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">疏凿饮子</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">阴水</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾阳虚衰</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾温阳，行气利水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">实脾饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阳衰微</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温肾助阳，化气行水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">济生肾气丸合真武汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀水互结</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血祛瘀，化气行水</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桃红四物汤合五苓散</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">阳水:阳水风毒水湿热</span><br />
                        <span className="reveal-text">越麻五味皮胃疏</span><br />
                        <span className="reveal-text">阴水:脾阳虚衰实脾饮</span><br />
                        <span className="reveal-text">济生真武肾阳衰</span><br />
                        <span className="reveal-text">瘀水互结桃五苓</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>血证</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">鼻衄</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热邪犯肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清泄肺热，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桑菊饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃热炽盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清胃泻火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">玉女煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火上炎</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补气摄血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">齿衄</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃火炽盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清胃泻火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">加味清胃散合泻心汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚火旺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六味地黄丸合茜根散</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">咳血</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">燥热伤肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热润肺，宁络止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桑杏汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火犯肺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">泻白散合黛蛤散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚肺热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴润肺，宁络止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">百合固金汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">吐血</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃热壅盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清胃泻火，化瘀止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">泻心汤合十灰散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火犯胃</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">泻肝清胃，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚血溢</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾益气摄血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">便血</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肠道湿热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清化湿热，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">地榆散合槐角丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热灼胃络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清胃止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">泻心汤合十灰散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚不摄</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气摄血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾胃虚寒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾温中，养血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄土汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">尿血</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">下焦湿热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">小蓟饮子</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾虚火旺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">知柏地黄丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾不统血</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补中健脾，益气摄血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾气不固</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补益肾气，固摄止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">无比山药丸</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">紫斑</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血热妄行</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热解毒，凉血止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">犀角地黄汤合十灰散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚火旺</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火，宁络止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">茜根散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气不摄血</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补气摄血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">鼻衄:鼻衄热迫肺胃肝</span><br />
                        <span className="reveal-text">桑菊玉女龙胆肝</span><br />
                        <span className="reveal-text">气血亏虚归脾汤</span><br />
                        <span className="reveal-text">齿衄:齿衄胃火泻心清</span><br />
                        <span className="reveal-text">六味茜根虚火旺</span><br />
                        <span className="reveal-text">咳血:咳血肝火燥阴虚</span><br />
                        <span className="reveal-text">泻白黛蛤与桑杏</span><br />
                        <span className="reveal-text">阴虚百合固金汤</span><br />
                        <span className="reveal-text">吐血:吐血气虚热肝犯</span><br />
                        <span className="reveal-text">归脾泻心十龙胆</span><br />
                        <span className="reveal-text">便血:湿热地槐黄土寒</span><br />
                        <span className="reveal-text">气虚不摄归脾汤</span><br />
                        <span className="reveal-text">胃热泻心十灰散</span><br />
                        <span className="reveal-text">尿血:湿热肾虚肾不固</span><br />
                        <span className="reveal-text">小蓟知柏山药丸</span><br />
                        <span className="reveal-text">脾不统血归脾汤</span><br />
                        <span className="reveal-text">紫斑:紫斑血热虚火旺</span><br />
                        <span className="reveal-text">十灰犀角茜根散</span><br />
                        <span className="reveal-text">气不摄血归脾汤</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>消渴</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">上消</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺热津伤</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热润肺，生津止渴</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">消渴方</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">中消</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">胃热炽盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清胃泻火，养阴增液</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">玉女煎</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气阴亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气健脾，生津止渴</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">七味白术散</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">下消</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阴亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴固肾</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">六味地黄丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴阳两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴温阳，补肾固涩</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">金匮肾气丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">肺消胃玉七白阴</span><br />
                        <span className="reveal-text">六味金匮阴阳虚</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>瘿病</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">瘿病</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气郁痰阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">理气舒郁，化痰消瘿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">四海舒郁丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰结血瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">理气活血，化痰消瘿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">海藻玉壶汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝火旺盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清肝泻火，消瘿散结</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">栀子清肝汤合消瘰丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">心肝阴虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴降火，宁心柔肝</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">天王补心丹或一贯煎</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">四海气痰海藻血</span><br />
                        <span className="reveal-text">一天心肝火栀消</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>内伤发热</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">内伤发热</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阴虚发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋阴清热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">清骨散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血虚发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">归脾汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气虚发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气健脾，甘温除热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">补中益气汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">阳虚发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补阳气，引火归原</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">金匮肾气丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气郁发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝理气，解郁泄热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">丹栀逍遥散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰湿郁热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">燥湿化痰，清热和中</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄连温胆汤合中和汤或三仁汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血瘀发热</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">血府逐瘀汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">虚证:阴清血归补阳金</span><br />
                        <span className="reveal-text">实证:气丹血府湿黄中三</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>癌病</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">癌病</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气郁痰瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">行气解郁，化痰祛瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">越鞠丸合化积丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热毒炽盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热凉血，解毒散瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">犀角地黄汤合犀黄丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热郁毒</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，解毒散结</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤合五味消毒饮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀毒内阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化瘀软坚，理气止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">血府逐瘀汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气阴两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养阴，扶正抗癌</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">生脉地黄汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补益气血，扶正抗癌</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">十全大补丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">扶正祛邪治癌病</span><br />
                        <span className="reveal-text">气郁痰瘀越鞠积</span><br />
                        <span className="reveal-text">热毒犀黄湿热泻</span><br />
                        <span className="reveal-text">瘀毒如刺逐瘀去</span><br />
                        <span className="reveal-text">气阴不足寻生脉</span><br />
                        <span className="reveal-text">气血十全大补丸</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痹证</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">风寒湿痹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">行痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">祛风通络，散寒除湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">防风汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痛痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">散寒通络，祛风除湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">乌头汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">着痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">除湿通络，祛风散寒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">薏苡仁汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">风湿热痹</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风湿热痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热通络，祛风除湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">白虎加桂枝汤或宣痹汤</span></div>
                        <div className="grid-category full-width"><span className="reveal-text">痹证</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">痰瘀痹阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">化痰行瘀，蠲痹通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">双合汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝肾亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">培补肝肾，舒筋止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">独活寄生汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒热错杂</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温经散寒，清热除湿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桂枝芍药知母汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气血虚痹</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养血，和营通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄芪桂枝五物汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">风寒湿痹行痛着</span><br />
                        <span className="reveal-text">防风乌头薏苡仁</span><br />
                        <span className="reveal-text">白加桂宣风湿热</span><br />
                        <span className="reveal-text">痰痹阻双合汤</span><br />
                        <span className="reveal-text">气血黄桂独肝肾</span><br />
                        <span className="reveal-text">寒热错杂桂芍知</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痿证</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">痿证</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肺热津伤</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热润燥，养阴生津</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">清燥救肺汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热浸淫</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，通利经脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">加味二妙散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾胃虚弱</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补中益气，健脾升清</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">参苓白术散合补中益气汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝肾亏损</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补益肝肾，滋阴清热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">虎潜丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脉络瘀阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养营，活血行瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">圣愈汤合补阳还五汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">肺脾肝肾湿热瘀</span><br />
                        <span className="reveal-text">燥参补虎二圣五</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>腰痛</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">腰痛</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒湿腰痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">散寒行湿，温经通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">甘姜苓术汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热腰痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，舒筋止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">四妙丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀血腰痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，通络止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">身痛逐瘀汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾虚腰痛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋补肾阴，濡养筋脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">左归丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阳虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补肾壮阳，温煦经脉</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">右归丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">四妙湿热寒甘姜</span><br />
                        <span className="reveal-text">瘀血身痛肾左右</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>乳癖</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">乳癖</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肝郁痰凝</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">疏肝解郁，化痰散结</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">逍遥蒌贝散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">冲任失调</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">调摄冲任</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">二仙汤合四物汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">肝郁痰凝逍遥贝</span><br />
                        <span className="reveal-text">冲任失调二仙四</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>湿疮</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">湿疮</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热蕴肤</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿止痒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">龙胆泻肝汤合萆薢渗湿汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾虚湿蕴</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">健脾利湿止痒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">除湿胃苓汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血虚风燥</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">养血润肤，祛风止痒</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">当归饮子或四物消风饮加丹参、鸡血藤、乌梢蛇</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">湿疮血虚当归饮</span><br />
                        <span className="reveal-text">湿热龙胆萆薢医</span><br />
                        <span className="reveal-text">除湿胃苓汤健脾</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>痔</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">痔</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">风热肠燥</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热凉血祛风</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">凉血地黄汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热下注</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿止血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">脏连丸</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气滞血瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，行气活血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">止痛如神汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾虚气陷</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补中益气，升阳举陷</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">补中益气汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">风热肠燥凉血地</span><br />
                        <span className="reveal-text">湿热下注脏连及</span><br />
                        <span className="reveal-text">气滞血瘀止如神</span><br />
                        <span className="reveal-text">脾虚气陷补中气</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>脱疽</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">脱疽</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">寒湿阻络</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温阳散寒，活血通络</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">阳和汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">血脉瘀阻</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">活血化瘀，通络止痛</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">桃红四物汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热毒盛</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，活血化瘀</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">四妙勇安汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热毒伤阴</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热解毒，养阴活血</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">顾步汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气阴两虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">益气养阴</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">黄芪鳖甲汤</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">脱疽寒湿阳和汤</span><br />
                        <span className="reveal-text">黄芪鳖甲气阴伤</span><br />
                        <span className="reveal-text">血瘀四物湿热勇</span><br />
                        <span className="reveal-text">热毒伤阴顾步汤</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>精癃</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">精癃</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热下注</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">清热利湿，消癃通闭</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">八正散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">脾肾气虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">补脾益气，温肾利尿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">补中益气汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">气滞血瘀</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">行气活血，通窍利尿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">沉香散</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阴亏虚</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">滋补肾阴，通窍利尿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">知柏地黄丸加丹参、琥珀、王不留行、地龙</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">肾阳不足</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">温补肾阳，通窍利尿</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">济生肾气丸</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">精癃湿热八正散</span><br />
                        <span className="reveal-text">气滞沉香脾肾益</span><br />
                        <span className="reveal-text">肾阴知柏阳济生</span>
                    </p>
                </div>
            </div>
            <div className="disease-entry">
                <h2>肠痈</h2>
                <div className="patterns">
                    <h3>证型与治法方剂:</h3>
                    <div className="pattern-grid">
                        <div className="grid-category full-width"><span className="reveal-text">肠痈</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">瘀滞证</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">行气活血，通腑泄热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大黄牡丹汤合红藤煎剂</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">湿热证</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">通腑泄热，解毒利湿透脓</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">复方大柴胡汤</span></div>
                        <div className="grid-item pattern-name"><span className="reveal-text">热毒证</span></div>
                        <div className="grid-item treatment-name"><span className="reveal-text">通腑排脓，养阴清热</span></div>
                        <div className="grid-item formula-name"><span className="reveal-text">大黄牡丹汤合透脓散</span></div>
                    </div>
                </div>
                <div className="mnemonic">
                    <h3>歌诀:</h3>
                    <p>
                        <span className="reveal-text">转移右下是肠痈</span><br />
                        <span className="reveal-text">初瘀苔白牡丹红</span><br />
                        <span className="reveal-text">湿热黄腻大柴胡</span><br />
                        <span className="reveal-text">热毒绛红牡丹脓</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
