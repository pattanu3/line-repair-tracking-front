function copyData() {
    let userName = document.getElementById("inputName").value;
    let userPhone = document.getElementById("inputPhone").value;

    let useAddressMain = document.getElementById("inputAddressMain").value;
    let userSubDistrict = document.getElementById("inputSubDistrict").value;
    let userDistrict = document.getElementById("inputDistrict").value;
    let useProvince = document.getElementById("inputProvince").value;
    let userZip = document.getElementById("inputZip").value;
    let userProblem = document.getElementById("inputProblem").value;
    let userDevice = document.getElementById("inputDevice").value;

    let userAppointDate = document.getElementById("inputDate").value;
    let userAppointTime = document.getElementById("inputTime").value;
    // let userDetail = document.getElementById("inputDetail").value;

    if (userName === "") { userName = "ไม่ได้ระบุชื่อ"; }
    if (userPhone === "") { userPhone = "ไม่ได้ระบุเบอร์โทรศัพท์"; }

    let fullAddress = useAddressMain + " ต./แขวง " + userSubDistrict + " อ./เขต " + userDistrict + " จ." + useProvince + " " + userZip;
    
    if (useAddressMain === "") { fullAddress = "ไม่ได้ระบุที่อยู่รับเครื่อง/ระบุไม่ครบ"; }
    if (userSubDistrict === "") { fullAddress = "ไม่ได้ระบุที่อยู่รับเครื่อง/ระบุไม่ครบ"; }
    if (userDistrict === "") { fullAddress = "ไม่ได้ระบุที่อยู่รับเครื่อง/ระบุไม่ครบ"; }
    if (useProvince === "") { fullAddress = "ไม่ได้ระบุที่อยู่รับเครื่อง/ระบุไม่ครบ"; }
    if (userZip === "") { fullAddress = "ไม่ได้ระบุที่อยู่รับเครื่อง/ระบุไม่ครบ"; }

    if (userProblem === "") { userProblem = "ไม่ได้ระบุปัญหา"; }
    if (userDevice === "กรุณาเลือกประเภท") {userDevice = "ไม่ได้ระบุประเภทอุปกรณ์"; }
    if (userAppointDate === "") { userAppointDate = "ไม่ได้ระบุวันที่"; }
    if (userAppointTime === "") { userAppointTime = "ไม่ได้ระบุเวลา"; }
    // if (userDetail === "") { userDetail = "ไม่ได้ระบุรายละเอียด"; }

    document.getElementById("modalName").innerText = userName;
    document.getElementById("modalPhone").innerText = userPhone;
    document.getElementById("modalAddress").innerText = fullAddress;
    document.getElementById("modalDevice").innerText = userDevice
    document.getElementById("modalProblem").innerText = userProblem;
    document.getElementById("modalDate").innerText = userAppointDate;
    document.getElementById("modalTime").innerText = userAppointTime;
}