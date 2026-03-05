
// /track/{line_user_id}

// 1. ตั้งค่าพื้นฐาน
const API_BASE_URL = 'https://uncautiously-overwealthy-margie.ngrok-free.dev';
const LIFF_ID = "2009179011-fTqvcgrw"; // LIFF ID ของหน้า Track (หรือใช้ตัวเดียวกับหน้าแจ้งซ่อมก็ได้)
let currentStageIndex = 1; 

// 2. Map สถานะจาก Database ให้ตรงกับเลข Timeline
const statusToTimelineMap = {
    'คำขอส่งซ่อม': 1,
    'กำลังไปรับเครื่อง': 2,
    'รับเครื่องแล้ว': 3,
    'เครื่องถึงร้าน': 4,
    'รอเช็คปัญหา': 5,
    'ตรวจเช็คปัญหา': 6,
    'ส่งใบเสนอราคา': 7,
    'ชำระเงินแล้ว': 8,
    'กำลังซ่อม': 9,
    'ซ่อมเสร็จแล้ว': 10,
    'กำลังส่งเครื่องกลับ': 11,
    'ลูกค้ากดรับเครื่องแล้ว': 12
};

// 3. เริ่มต้นการทำงานของหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
    console.log("page load");
    initTrackPage();
});

async function initTrackPage() {
    console.log("initTrackPage load");
    try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            const userId = profile.userId;

            console.log(profile);
            console.log(userId);
            document.getElementById('user-id').innerText = userId;
            // แสดงผลบนหน้าจอ
            // อัปเดตชื่อ LINE ลูกค้าบน Banner
            const welcomeText = document.querySelector('.welcome-text h3');
            if(welcomeText) welcomeText.innerText = `- ${profile.displayName} -`;
            
            const profilePic = document.querySelector('.profile-pic');
            if(profilePic) profilePic.src = profile.pictureUrl || "https://placehold.co/100x100?text=Profile";

            // ไปดึงข้อมูลงานซ่อมจาก Database
            fetchRepairData(profile.userId);
        } else {
            liff.login();
        }
    } catch (err) {
        console.error("LIFF Init Error:", err);
        alert("ไม่สามารถเชื่อมต่อ LINE ได้", err);
    }
}

// 4. ดึงข้อมูลจาก FastAPI
async function fetchRepairData(lineUserId) {
    console.log("fetchRepairData Work");
    // ตรวจสอบเบื้องต้น ถ้ายังโหลดไม่เสร็จไม่ให้ส่ง
     try {
        // ✅ เพิ่ม headers เข้าไปเพื่อข้ามหน้าต่างของ ngrok
        const response = await fetch(`https://uncautiously-overwealthy-margie.ngrok-free.dev/repairs/track?line_user_id=${lineUserId}`, {
            method: 'GET',
            headers: {
                'ngrok-skip-browser-warning': '69420', // คำสั่งข้ามหน้าแจ้งเตือน ngrok
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // ถ้าไม่ใช่ 200 OK ให้ลองอ่านค่าว่า Backend พ่น Error อะไรมา
            let errorMsg = "ไม่พบข้อมูลแจ้งซ่อม";
            try {
                const errData = await response.json();
                if (errData.detail) errorMsg = errData.detail;
                window.location.href = 'notfound_track.html';
            } catch (e) {} // ถ้าพังตอนอ่าน json ให้ข้ามไป

            alert(errorMsg);
            return;
        }   
        const data = await response.json();
        console.log("JSON DATA",data);
        
        // ก. อัปเดตข้อมูลลูกค้าลงในหน้าต่างรายละเอียด
        document.getElementById("repairId").innerText = data.id;
        document.querySelector('.queue-value').innerText = data.queueId || '-';
        document.getElementById("modalName").innerText = data.fullName || '-';
        document.getElementById("modalPhone").innerText = data.phoneNumber || '-';
        document.getElementById("modalAddress").innerText = data.address || '-';
        document.getElementById("modalDevice").innerText = data.deviceType || '-';
        document.getElementById("modalProblem").innerText = data.problemType || '-';
        document.getElementById("modalDate").innerText = data.pickupDate || 'ยังไม่ระบุ';
        document.getElementById("modalTime").innerText = 'รอแจ้งจากช่าง'; // เพิ่ม field time ใน schema ภายหลังได้

        // ข. คำนวณสถานะปัจจุบัน (Timeline)
        currentStageIndex = statusToTimelineMap[data.status] || 1;
        
        // ค. วาด Timeline ใหม่
        renderTimeline();

    } catch(error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์:", error);
    }
}
  
//--------------------------------------------------------------------------------------------------


const quotationItems = [
    { name: "แผงวงจรแรม (RAM) 8GB", amount: 2, price: 950 },
    { name: "เปลี่ยนหน้าจอ 15.6 นิ้ว", amount: 1, price: 2500 },
    { name: "ชุดแป้นพิมพ์ (Keyboard)", amount: 4, price: 800 },
    { name: "ค่าบริการซ่อม/ตรวจสอบ", amount: 1, price: 500 }
];

// const repairRequestData = {
//     name: "กำไม่บัง บุญไม่มี",
//     phone: "069-676-6677",
//     address: "123 หมู่ 4 ต.บัง อ.ลาดบัง จ.ลาดกระบัง 69696",
//     device: "โน้ตบุ๊ก Asus ROG",
//     problem: "แรมสบัด จอเสีย แป้นพิมพ์หลุด",
//     date: "4 มี.ค. 2026",
//     time: "10:00 - 12:00 น."
// };

const queueImagesFromDB = {
    before: [
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=200&fit=crop", 
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&h=200&fit=crop"
    ],
    arrive: [
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&h=200&fit=crop"
    ],
    during: [
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop",
    ],
    after: []
};

const allStages = [
    { title: "คำขอส่งซ่อม", desc: "ทางร้านจะติดต่อกลับเพื่อยืนยันรายละเอียดและนัดรับเครื่องครับ", color: "#e6442e", },
    { title: "กำลังไปรับเครื่อง", desc: "กำลังเดินทางไปรับเครื่องตามเวลานัดหมาย จะทำการโทรแจ้งก่อนถึงประมาณ 10-15 นาทีครับ", color: "#f7762b" },
    { title: "รับเครื่องแล้ว", desc: "กำลังดำเนินการนำเครื่องเข้าร้านเพื่อทำการตรวจเช็คปัญหา", color: "#2983d8" },
    { title: "เครื่องถึงร้าน", 
        desc: "เครื่องถึงร้านเรียบร้อยแล้ว เตรียมนำเข้าคิวรอตรวจเช็คปัญหา", 
        color: "#79d163", 
        extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="showPhotoModal()" style="border-radius: 20px; background-color:#09348a; color: white"><i class="fa-solid fa-file-image"></i> คลิกเพื่อดูรูปภาพ</button>` },
    { title: "รอเช็คปัญหา", desc: "", color: "#775adf" },
    { title: "ตรวจเช็คปัญหา", 
        desc: "เมื่อได้สาเหตุและแนวทางการซ่อม ทางร้านจะแจ้งรายละเอียดพร้อมราคาให้ทราบครับ",
        color: "#2983d8",
        technician: "บุณมี กำบัง",},
        // extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" style="border-radius: 10px; background-color:#286aee; color: white"><i class="fa-solid fa-search"></i> คลิกเพื่อดูช่างที่รับผิดชอบ</button>` },
    { title: "ส่งใบเสนอราคา", 
        desc: "รบกวนลูกค้ายืนยันเพื่อให้ร้านดำเนินการซ่อมต่อได้ครับ", 
        color: "#e6442e",
        extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="showQuotationModal(document.getElementById('repairId').innerText)" style="border-radius: 20px; background-color:#09348a; color: white"><i class="fa-solid fa-list-alt"></i> คลิกเพื่อดูรายละเอียดใบเสนอราคา</button>` },
    { title: "ชำระเงินแล้ว", 
        desc: "ได้รับการทำระเงินเรียบร้อยแล้ว ทางร้านจะดำเนินการซ่อมทันทีครับ", 
        color: "#79d163",
        technician: "กำบัง บุณไม่มี",
        queueLeft: 3,},
    { title: "กำลังซ่อม", 
        desc: "ขณะนี้กำลังดำเนินการซ่อมอยู่ หากเสร็จแล้วจะแจ้งให้ทราบทันทีครับ", 
        color: "#2983d8",
        expectDate: "1/2/2003",
        technician: "มีบุณ แต่เป็นบัง",
    },
    { title: "ซ่อมเสร็จแล้ว", desc: 
        "ผ่านการทดสอบเบื้องต้น พร้อมส่งคืนให้ลูกค้าครับ", 
        color: "#79d163",
        extraHTML: `
            <div>
                <button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="window.location.href='return.html'" style="border-radius: 20px; background-color:#286aee; color: white">
                    <i class="fa fa-book"></i> คลิกเพื่อกรอกรายละเอียดส่งเครื่องคืน
                </button>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="showPhotoModal()" style="border-radius: 20px; background-color:#09348a; color: white">
                    <i class="fa-solid fa-file-image"></i> คลิกเพื่อดูรูปภาพ
                </button>
            </div>`,
        },
    { title: "กำลังส่งเครื่องกลับ", 
        desc: "กำลังจัดส่งให้ลูกค้า จะถึงตามเวลานัดหมาย", 
        color: "#f7762b",
        extraHTML: `<button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="simulateNextStep()" style="border-radius: 20px; background-color:#f7762b; color: white"><i class="fa fa-check"></i> คลิกเพื่อยืนยันการรับเครื่อง </button>`,         
        },
    { title: "ลูกค้ากดรับเครื่องแล้ว", desc: "ขอบคุณที่ใช้บริการครับ หากมีปัญหาหลังซ่อม สามารถติดต่อร้านได้ทันที", color: "#79d163" },
];

// let currentStageIndex = 1; 

function renderTimeline() {
    let timelineHTML = "";

    let currentActiveColor = allStages[currentStageIndex - 1].color;
    
    for (let i = 0; i < currentStageIndex; i++) {
        let isLastStep = (i === currentStageIndex - 1);
        let statusClass = isLastStep ? "active" : "completed";
        let dotStyle = isLastStep ? `background-color: ${currentActiveColor};` : '';
        let extraContent = "";
        // let extraContent = (isLastStep && allStages[i].extraHTML) ? allStages[i].extraHTML : '';
        // let textStyle = isLastStep ? `color: ${currentActiveColor};` : '';

        if (isLastStep) {
            if (allStages[i].queueLeft !== undefined) {
                extraContent = `
                <div>
                    <div style="margin-top: -5px;">
                        <span style="font-size: 13px; color: #154388;">
                            <strong>จำนวนคิว : </strong>
                            <light style="color: #154388;">${allStages[i].queueLeft} คิว</light>
                        </span>
                    </div>
                    <div style="margin-top: -10px;">
                        <span style="font-size: 13px; color: #154388;">
                            <strong>ช่างที่รับผิดชอบ : </strong>
                            <light style="color: #154388;">${allStages[i].technician}</light>
                        </span>
                    <button class="btn btn-sm btn-outline-secondary mt-1 w-10" style="border-radius: 50%; background-color:#09348a; color: white;"><i class="fa-solid fa-search"></i></button>
                    </div>
                </div>`;
            } 
            else if (allStages[i].expectDate !== undefined) {
                extraContent = `
                <div>
                    <div style="margin-top: -5px;">
                        <span style="font-size: 13px; color: #154388;">
                            <strong>วันที่คาดว่าจะเสร็จ : </strong>
                            <light style="color: #154388;">${allStages[i].expectDate}</light>
                        </span>
                    </div>
                    <div style="margin-top: -10px;">
                        <span style="font-size: 13px; color: #154388;">
                            <strong>ช่างที่รับผิดชอบ : </strong>
                            <light style="color: #154388;">${allStages[i].technician}</light>
                        </span>
                    <button class="btn btn-sm btn-outline-secondary mt-1 w-10" style="border-radius: 50%; background-color:#09348a; color: white;"><i class="fa-solid fa-search"></i></button>
                    </div>
                    <div style="margin-top: 0px;">
                        <button class="btn btn-sm btn-outline-secondary mt-1 w-40" onclick="showPhotoModal()" style="border-radius: 20px; background-color:#09348a; color: white"><i class="fa-solid fa-file-image"></i> คลิกเพื่อดูรูปภาพ</button>
                    </div>
                </div>`;
            } 
            else if (allStages[i].technician !== undefined) {
                extraContent = `
                <div style="margin-top: -10px;">
                    <span style="font-size: 13px; color: #154388;">
                        <strong>ช่างที่รับผิดชอบ : </strong>
                        <light style="color: #154388;">${allStages[i].technician}</light>
                    </span>
                    <button class="btn btn-sm btn-outline-secondary mt-1 w-10" style="border-radius: 50%; background-color:#09348a; color: white;"><i class="fa-solid fa-search"></i></button>
                </div>`;
            }
            else if (allStages[i].extraHTML) {
                extraContent = allStages[i].extraHTML;
            }
        }

        timelineHTML += `
            <div class="timeline-step ${statusClass}">
                <div class="timeline-dot" style="${dotStyle}"></div>
                <div class="timeline-title">${allStages[i].title}</div>
                <div class="timeline-desc ${isLastStep ? 'text-black fw-bold' : ''}">${allStages[i].desc}</div>
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

// function loadRequestDetails() {
//     document.getElementById("modalName").innerText = repairRequestData.name;
//     document.getElementById("modalPhone").innerText = repairRequestData.phone;
//     document.getElementById("modalAddress").innerText = repairRequestData.address;
//     document.getElementById("modalDevice").innerText = repairRequestData.device;
//     document.getElementById("modalProblem").innerText = repairRequestData.problem;
//     document.getElementById("modalDate").innerText = repairRequestData.date;
//     document.getElementById("modalTime").innerText = repairRequestData.time;
// }

function renderGallery(containerId, imagesArray) {
    const container = document.getElementById(containerId);
    let html = "";

    if (!imagesArray || imagesArray.length === 0) {
        container.innerHTML = `<div class="col-12"><p class="text-muted mb-0" style="font-size: 12px; font-style: italic;">ยังไม่มีรูปภาพในขั้นตอนนี้</p></div>`;
        return;
    }

    imagesArray.forEach(imgUrl => {
        html += `
            <div class="col-4">
                <img src="${imgUrl}" class="img-fluid rounded shadow-sm" style="height: 80px; width: 100%; object-fit: cover; border: 1px solid #ddd;" alt="รูปภาพประกอบ">
            </div>
        `;
    });

    container.innerHTML = html;
}

function showPhotoModal() {
    renderGallery("gallery-before", queueImagesFromDB.before);
    renderGallery("gallery-arrive", queueImagesFromDB.arrive);
    renderGallery("gallery-during", queueImagesFromDB.during);
    renderGallery("gallery-after", queueImagesFromDB.after);

    const photoModal = new bootstrap.Modal(document.getElementById('imageModal'));
    photoModal.show();
}

function scrollGallery(containerId, direction) {
    const container = document.getElementById(containerId);
    const scrollAmount = 120;
    
    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function renderGallery(containerId, imagesArray) {
    const container = document.getElementById(containerId);
    let html = "";

    if (!imagesArray || imagesArray.length === 0) {
        container.innerHTML = `<div class="w-100"><p class="text-muted mb-0" style="font-size: 12px; font-style: italic;">ยังไม่มีรูปภาพในขั้นตอนนี้</p></div>`;
        return;
    }

    imagesArray.forEach(imgUrl => {
        html += `
            <div style="flex: 0 0 auto; width: 100px;">
                <img src="${imgUrl}" class="img-fluid rounded shadow-sm" style="height: 80px; width: 100%; object-fit: cover; border: 1px solid #ddd;" alt="รูปภาพประกอบ">
            </div>
        `;
    });

    container.innerHTML = html;
}

async function showQuotationModal(repairID) {
    console.log(`repairId ${repairID}`);
    try {
        const response = await fetch(`https://uncautiously-overwealthy-margie.ngrok-free.dev/repairs/quotations?repair_id=${repairID}`, {
            method: 'GET',
            headers: {
                'ngrok-skip-browser-warning': '69420',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMsg = "ไม่พบข้อมูลใบเสนอราคา";
            try {
                const errData = await response.json();
                if (errData.detail) errorMsg = errData.detail;
            } catch (e) {}
            alert(errorMsg);
            console.log(errorMsg);
            return;
        }

        const data = await response.json();
        console.log("Quotation DATA", data);

        // 1. ดึงข้อมูลจากก้อน 'repair' มาแสดงหัวเอกสาร
        document.getElementById("quoteName").innerText = data.repair.fullName || '-';
        document.getElementById("quoteDevice").innerText = data.repair.deviceType || '-';
        document.getElementById("quoteProblem").innerText = data.repair.problemType || '-';
        
        // ใช้วันที่นัดรับเครื่องเป็นวันที่ในใบเสนอราคา หรือใช้ New Date() แทนได้
        document.getElementById("quoteDate").innerText = data.repair.pickupDate || '-';
        
        // 2. จัดการตารางรายการซ่อมจาก 'items'
        const tableBody = document.getElementById("quoteTableBody");
        let tableHtml = "";
        
        // ตรวจสอบว่ามีรายการใน items หรือไม่
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const rowTotal = item.quantity * item.price;
                tableHtml += `
                    <tr>
                        <td class="pt-3 text-start">&emsp;${item.productName}</td>
                        <td class="pt-3 text-center">${item.quantity}</td>
                        <td class="pt-3 text-center">${item.price.toLocaleString()}</td>
                        <td class="pt-3 text-center">${rowTotal.toLocaleString()}</td>
                    </tr>
                `;
            });
        }

        tableBody.innerHTML = tableHtml;
        
        // 3. แสดงยอดรวมสุทธิจาก 'totalPrice'
        document.getElementById("quoteTotalCost").innerText = data.totalPrice.toLocaleString();
        currentTotalCost = data.totalPrice;

        // 4. ส่งหมายเหตุจากช่างไปยังพื้นที่ Action
        renderQuoteApproval(data.technicianNote);

        const quoteModal = new bootstrap.Modal(document.getElementById('quotationModal'));
        quoteModal.show();

    } catch(error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์:", error);
    }
}

// ############################ Quotation-sequence ############################
let currentTotalCost = 0;


// ปรับปรุงฟังก์ชัน renderQuoteApproval ให้รับค่า Note มาแสดง
function renderQuoteApproval(techNote) {
    const container = document.getElementById("quoteActionArea");
    container.innerHTML = `
        <strong style="color: #001f61; font-size: 16px;">หมายเหตุจากช่าง</strong>
        <div class="p-3 mb-3 rounded" style="background-color: #f8f9fa; border: 1px solid #e9ecef; margin-left: 20px">
            <p class="text-muted mb-0" style="font-size: 14px;">${techNote || 'ไม่มีหมายเหตุเพิ่มเติม'}</p>
        </div>
        <div class="w-100 mt-4 clearfix">
            <button class="btn rounded-pill px-4 shadow-sm float-start" onclick="handleRejectQuote()" style="background-color: #dfdfdf; font-size: 12px;">ยกเลิกการซ่อม</button>
            <button class="btn rounded-pill px-4 shadow-sm float-end" onclick="handleApproveQuote()" style="background-color: #1549b8; color: white; font-size: 14px;">ยืนยันการซ่อม</button>
        </div>
    `;
}
// function renderQuoteApproval() {
//     const container = document.getElementById("quoteActionArea");
//     container.innerHTML = `
//         <strong style="color: #001f61; font-size: 16px;">หมายเหตุจากช่าง</strong>
//         <div class="p-3 mb-3 rounded" style="background-color: #f8f9fa; border: 1px solid #e9ecef; margin-left: 20px">
//             <p class="text-muted mb-0" style="font-size: 14px;">ปกติดีครับ</p>
//         </div>
//         <div class="w-100 mt-4 clearfix">
//             <button class="btn rounded-pill px-4 shadow-sm float-start" onclick="handleRejectQuote()" style="background-color: #dfdfdf; font-size: 12px;">ยกเลิกการซ่อม</button>
//             <button class="btn rounded-pill px-4 shadow-sm float-end" onclick="handleApproveQuote()" style="background-color: #1549b8; color: white; font-size: 14px;">ยืนยันการซ่อม</button>
//         </div>
//     `;
// }

function handleRejectQuote() {
    currentStageIndex = 11;
    renderTimeline();

    const quoteModal = bootstrap.Modal.getInstance(document.getElementById('quotationModal'));
    quoteModal.hide();
}

function handleApproveQuote() {
    renderQuotePayment();
}

function renderQuotePayment() {
    const container = document.getElementById("quoteActionArea");
    container.innerHTML = `
        <div class="text-center">
            <h6 style="color: #001f61;" class="fw-bold">ช่องทางการชำระเงิน</h6>
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" class="img-fluid my-2 shadow-sm" style="width: 140px; height: 140px; border-radius: 10px;">
            
            <h4 class="fw-bold my-2" style="font-size: 14px; color:#001f61;">${currentTotalCost.toLocaleString()} บาท</h4>
            
            <div class="d-flex justify-content-center gap-2 mt-3 pt-2" style="border-top: 1px dashed #ddd;">
                <button class="btn btn-sm btn-outline-success" onclick="handlePaymentResult(true)">จำลอง: จ่ายสำเร็จ</button>
                <button class="btn btn-sm btn-outline-danger" onclick="handlePaymentResult(false)">จำลอง: จ่ายล้มเหลว</button>
            </div>
        </div>
    `;
}

function handlePaymentResult(isSuccess) {
    const container = document.getElementById("quoteActionArea");
    if (isSuccess) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fa-solid fa-circle-check text-success mb-2" style="font-size: 60px;"></i>
                <h5 class="fw-bold text-success">ชำระเงินสำเร็จ</h5>
            </div>
        `;
        
        setTimeout(() => {
            currentStageIndex = 8;
            renderTimeline();
            const quoteModal = bootstrap.Modal.getInstance(document.getElementById('quotationModal'));
            quoteModal.hide();
        }, 3000);
        
    } else {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fa-solid fa-circle-xmark text-danger mb-2" style="font-size: 60px;"></i>
                <h5 class="fw-bold text-danger">ชำระเงินล้มเหลว</h5>
                <button class="btn btn-outline-secondary btn-sm mt-2 rounded-pill px-4" onclick="renderQuotePayment()">ลองอีกครั้ง</button>
            </div>
        `;
    }
}

function handleRejectQuote() {
    window.location.href = 'return.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetStage = urlParams.get('stage');

    if (targetStage !== null) {
        currentStageIndex = parseInt(targetStage, 10);
        renderTimeline(); 
    }
});

// loadRequestDetails();
renderTimeline();