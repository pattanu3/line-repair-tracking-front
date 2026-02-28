    const allStages = [
        { title: "รับคำขอซ่อมเรียบร้อยแล้ว", desc: "ทางร้านจะติดต่อกลับเพื่อยืนยันรายละเอียดและนัดรับเครื่องครับ", color: "#e6442e", },
        { title: "กำลังไปรับเครื่อง", desc: "กำลังเดินทางไปรับเครื่องตามเวลานัดหมาย จะทำการโทรแจ้งก่อนถึงประมาณ 10-15 นาทีครับ", color: "#f7762b" },
        { title: "รับเครื่องแล้ว", desc: "กำลังดำเนินการนำเครื่องเข้าร้านเพื่อทำการตรวจเช็คปัญหา", color: "#2983d8" },
        { title: "เครื่องถึงร้าน", 
            desc: "เครื่องถึงร้านเรียบร้อยแล้ว เตรียมนำเข้าคิวรอตรวจเช็คปัญหา", 
            color: "#79d163", 
            extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" style="border-radius: 10px; background-color:#286aee; color: white"><i class="fa-solid fa-file-image"></i> คลิกเพื่อดูรูปภาพ</button>` },
        { title: "รอเช็คปัญหา", desc: "", color: "#775adf" },
        { title: "ตรวจเช็คปัญหา", 
            desc: "เมื่อได้สาเหตุและแนวทางการซ่อม ทางร้านจะแจ้งรายละเอียดพร้อมราคาให้ทราบครับ",
            color: "#2983d8", 
            extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" style="border-radius: 10px; background-color:#286aee; color: white"><i class="fa-solid fa-search"></i> คลิกเพื่อดูช่างที่รับผิดชอบ</button>` },
        { title: "ได้รับใบเสนอราคา", 
            desc: "รบกวนลูกค้ายืนยันเพื่อให้ร้านดำเนินการซ่อมต่อได้ครับ", 
            color: "#e6442e",
            extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" style="border-radius: 10px; background-color:#286aee; color: white"><i class="fa-solid fa-list-alt"></i> คลิกเพื่อดูรายละเอียดใบเสนอราคา</button>` },
        { title: "ชำระเงินแล้ว", desc: "ได้รับการทำระเงินเรียบร้อยแล้ว ทางร้านจะดำเนินการซ่อมทันทีครับ", color: "#79d163" },
        { title: "กำลังซ่อม", desc: "ขณะนี้กำลังดำเนินการซ่อมอยู่ หากเสร็จแล้วจะแจ้งให้ทราบทันทีครับ", color: "#2983d8" },
        { title: "ซ่อมเสร็จ", desc: "ผ่านการทดสอบเบื้องต้น พร้อมส่งคืนให้ลูกค้าครับ", color: "#79d163" },
        { title: "กำลังส่งเครื่องกลับ", desc: "กำลังจัดส่งให้ลูกค้า จะถึงตามเวลานัดหมาย", color: "#f7762b" },
        { title: "ลูกค้ากดรับเครื่องแล้ว", desc: "ขอบคุณที่ใช้บริการครับ หากมีปัญหาหลังซ่อม สามารถติดต่อร้านได้ทันที", color: "#79d163" },
    ];

    let currentStageIndex = 1; 

    function renderTimeline() {
        let timelineHTML = "";

        let currentActiveColor = allStages[currentStageIndex - 1].color;
        
        for (let i = 0; i < currentStageIndex; i++) {
            let isLastStep = (i === currentStageIndex - 1);
            let statusClass = isLastStep ? "active" : "completed";
            let dotStyle = isLastStep ? `background-color: ${currentActiveColor};` : '';
            let extraContent = (isLastStep && allStages[i].extraHTML) ? allStages[i].extraHTML : '';
            // let textStyle = isLastStep ? `color: ${currentActiveColor};` : '';

            timelineHTML += `
                <div class="timeline-step ${statusClass}">
                    <div class="timeline-dot" style="${dotStyle}"></div>
                    <div class="timeline-title">${allStages[i].title}</div>
                    <div class="timeline-desc ${isLastStep ? 'text-primary fw-bold' : ''}">${allStages[i].desc}</div>
                    ${extraContent}
                </div>
            `;
        }

        // let linePercent = currentStageIndex === 1 ? 0 : ((currentStageIndex - 1) / (allStages.length - 1)) * 100;
        let blueLineHTML = `<div class="timeline-progress" id="blueLine" style="height: 0px;"></div>`;
        document.getElementById("timelineBox").innerHTML = blueLineHTML + timelineHTML;
        let activeSteps = document.querySelectorAll(".timeline-step");
        let lastStepElement = activeSteps[activeSteps.length - 1];

        if (lastStepElement) {
            let exactHeight = lastStepElement.offsetTop + 14;
            setTimeout(() => {
                document.getElementById("blueLine").style.height = exactHeight + "px";
            }, 50);
        }

        document.getElementById("timelineBox").innerHTML = blueLineHTML + timelineHTML;
    }

    function simulateNextStep() {
        if (currentStageIndex < allStages.length) {
            currentStageIndex++; 
            renderTimeline();    
        } else {
            alert("กระบวนการเสร็จสมบูรณ์แล้ว!");
        }
    }

    // Draw the first step on load
    renderTimeline();