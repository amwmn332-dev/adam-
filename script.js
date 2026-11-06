// Array to store cart elements
let cart = [];
let isCheckoutStep = false;

// DOM Elements
const bikeTypeSelect = document.getElementById('bikeType');
const wheelSizeSelect = document.getElementById('wheelSize');
const brakeTypeSelect = document.getElementById('brakeType');
const searchInput = document.getElementById('searchInput');
const priceSortSelect = document.getElementById('priceSort');
const resetBtn = document.getElementById('resetBtn');
const productsGrid = document.getElementById('productsGrid');

// Event listeners for filtering & sorting
if (bikeTypeSelect) bikeTypeSelect.addEventListener('change', filterProducts);
if (wheelSizeSelect) wheelSizeSelect.addEventListener('change', filterProducts);
if (brakeTypeSelect) brakeTypeSelect.addEventListener('change', filterProducts);
if (searchInput) searchInput.addEventListener('input', filterProducts);
if (priceSortSelect) priceSortSelect.addEventListener('change', filterProducts);

// Function to filter & sort products based on compatibility, search, and price
function filterProducts() {
    const bikeValue = bikeTypeSelect ? bikeTypeSelect.value : "";
    const wheelValue = wheelSizeSelect ? wheelSizeSelect.value : "";
    const brakeValue = brakeTypeSelect ? brakeTypeSelect.value : "";
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const sortValue = priceSortSelect ? priceSortSelect.value : "";

    let activeFilters = bikeValue || wheelValue || brakeValue || searchValue || sortValue;
    if (resetBtn) {
        resetBtn.style.display = activeFilters ? 'inline-block' : 'none';
    }

    let productCards = Array.from(document.querySelectorAll('.product-card'));

    // 1. Filtering Logic
    productCards.forEach(product => {
        const pType = product.getAttribute('data-type') || "";
        const pWheel = product.getAttribute('data-wheel') || "";
        const pBrake = product.getAttribute('data-brake') || "";
        
        const titleEl = product.querySelector('.product-title');
        const categoryEl = product.querySelector('.product-category');
        
        const pTitle = titleEl ? titleEl.innerText.toLowerCase() : "";
        const pCategory = categoryEl ? categoryEl.innerText.toLowerCase() : "";

        let matchType = !bikeValue || pType === bikeValue || pType === "";
        let matchWheel = !wheelValue || pWheel === wheelValue || pWheel === "";
        let matchBrake = !brakeValue || pBrake === brakeValue || pBrake === "";
        let matchSearch = !searchValue || pTitle.includes(searchValue) || pCategory.includes(searchValue);

        if (matchType && matchWheel && matchBrake && matchSearch) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });

    // 2. Sorting Logic (ترتيب المنتجات حسب السعر)
    if (sortValue && productsGrid) {
        let visibleCards = productCards.filter(card => card.style.display !== 'none');

        visibleCards.sort((a, b) => {
            let priceA = parseFloat(a.getAttribute('data-price')) || 0;
            let priceB = parseFloat(b.getAttribute('data-price')) || 0;

            if (sortValue === 'high-low') {
                return priceB - priceA; // من الأغلى للأرخص
            } else if (sortValue === 'low-high') {
                return priceA - priceB; // من الأرخص للأغلى
            }
            return 0;
        });

        // إعادة ترتيب الكروت داخل الـ Grid
        visibleCards.forEach(card => productsGrid.appendChild(card));
    }
}

// Function to reset all filters
function resetFilters() {
    if (bikeTypeSelect) bikeTypeSelect.value = "";
    if (wheelSizeSelect) wheelSizeSelect.value = "";
    if (brakeTypeSelect) brakeTypeSelect.value = "";
    if (searchInput) searchInput.value = "";
    if (priceSortSelect) priceSortSelect.value = "";
    filterProducts();
}

// Function for Image Slider Scroll
function scrollSlide(button, direction) {
    const slider = button.parentElement.querySelector('.slides-wrapper');
    if (slider) {
        const slideWidth = slider.clientWidth;
        slider.scrollBy({
            left: direction * slideWidth,
            behavior: 'smooth'
        });
    }
}

// Cart UI Functions
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    if (cartModal && overlay) {
        cartModal.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function addToCart(title, price) {
    cart.push({ title, price });
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSum = document.getElementById('cartTotalSum');

    if (cartCount) cartCount.innerText = cart.length;

    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: #7f8c8d; margin-top: 20px;">السلة فارغة حالياً</p>`;
        if (cartTotalSum) cartTotalSum.innerText = `0 ج.م`;
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price} ج.م</div>
                </div>
                <i class="fas fa-trash" style="color:#e74c3c; cursor:pointer;" onclick="removeFromCart(${index})"></i>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    if (cartTotalSum) cartTotalSum.innerText = `${total} ج.م`;
}

// Internal Checkout System (محدث لإرسال تفاصيل الطلب عبر الواتساب مباشرة للبائع)
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('سلتك فارغة!');
        return;
    }

    const form = document.getElementById('checkoutForm');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!isCheckoutStep) {
        form.style.display = 'block';
        checkoutBtn.innerText = 'تأكيد وإرسال الطلب عبر الواتساب';
        isCheckoutStep = true;
    } else {
        const name = document.getElementById('clientName').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const address = document.getElementById('clientAddress').value.trim();

        if (!name || !phone || !address) {
            alert('برجاء استكمال بيانات الشحن (الاسم، الهاتف، العنوان)');
            return;
        }

        // تجميع تفاصيل المنتجات في رسالة واتساب منسقة
        let orderDetails = "🛍️ *طلب جديد من متجر إكسسوار آدم*\n\n";
        orderDetails += `👤 *الاسم:* ${name}\n`;
        orderDetails += `📞 *الهاتف:* ${phone}\n`;
        orderDetails += `📍 *العنوان:* ${address}\n\n`;
        orderDetails += `🛒 *المنتجات المطلوبة:*\n`;

        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            orderDetails += `${index + 1}. ${item.title} - ${item.price} ج.م\n`;
        });

        orderDetails += `\n💰 *الإجمالي الكلي:* ${total} ج.م`;

        // رقم الواتساب الخاص بك
        const vendorWhatsApp = "201029290236"; 

        const encodedMessage = encodeURIComponent(orderDetails);
        const whatsappURL = `https://wa.me/${vendorWhatsApp}?text=${encodedMessage}`;

        // فتح واتساب مباشرة برسالة الطلب الجاهزة
        window.open(whatsappURL, '_blank');
        
        cart = [];
        updateCartUI();
        form.style.display = 'none';
        checkoutBtn.innerText = 'إتمام الطلب';
        isCheckoutStep = false;
        toggleCart();
    }
}

// فتح وغلق الشات بوت الدائري
function toggleChatbot() {
    const chatContainer = document.getElementById('chatbot-container');
    if (chatContainer) {
        chatContainer.classList.toggle('chatbot-closed');
    }
}

// إرسال الرسالة بالضغط على الزر أو Enter
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendUserMessage();
    }
}

function sendUserMessage() {
    const inputField = document.getElementById('chatbot-input');
    if (!inputField) return;
    const messageText = inputField.value.trim();
    if (!messageText) return;

    appendMessage(messageText, 'user-msg');
    inputField.value = '';

    setTimeout(() => {
        const botReply = generateSmartReply(messageText);
        appendMessage(botReply, 'bot-msg');
    }, 500);
}

function appendMessage(text, className) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.innerHTML = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// محرك الشات بوت الذكي المعزز بجميع المنتجات والأسئلة الشائعة وخدمة ما بعد البيع ومصاريف الشحن
function generateSmartReply(userQuery) {
    const q = userQuery.toLowerCase();

    // 1. خدمة ما بعد البيع والأسئلة الشائعة والشحن
    if (q.includes('ضمان') || q.includes('في ضمان')) {
        return 'نعم، متوفر ضمان على جميع الدراجات وقطع الغيار ضد عيوب الصناعة في متجر إكسسوار آدم 🛡️.';
    }
    else if (q.includes('استبدال') || q.includes('بدل') || q.includes('متاح استبدال')) {
        return 'نعم، متاح استبدال المنتج خلال <b>٢٤ ساعة</b> من تاريخ الشراء، بشرط أن يكون بحالته الأصلية 🔄.';
    }
    else if (q.includes('ارجاع') || q.includes('استرجاع') || q.includes('ارجع') || q.includes('رجع')) {
        return 'نعم، متاح إرجاع المنتج خلال <b>٢٤ ساعة</b> من تاريخ الشراء 📦.';
    }
    else if (q.includes('صيانة') || q.includes('تصليح') || q.includes('بتصلحوا')) {
        return 'أكيد! نوفر خدمة صيانة متكاملة للدراجات وتركيب قطع الغيار الأصلية داخل المحل 🛠️.';
    }
    else if (q.includes('مواعيد') || q.includes('وقت') || q.includes('شغالين') || q.includes('تفتحوا') || q.includes('تقفلوا') || q.includes('الساعة')) {
        return 'مواعيد العمل في المتجر: كل يوم من <b>١٠ صباحاً حتى ١٠ مساءً</b>، ما عدا يوم الجمعة من <b>٤ عصراً حتى ١٠ مساءً</b> ⏰.';
    }
    else if (q.includes('تكلفة الشحن') || q.includes('مصاريف الشحن') || q.includes('شحن كام') || q.includes('كام الشحن')) {
        return 'تكلفة الشحن ثابتة وبتكون <b>١٥٠ ج.م</b> لكل الطلبات 📦.';
    }
    else if (q.includes('محافظات') || q.includes('بنوصل فين') || q.includes('المحافظات المتاحة') || q.includes('نوصل فين')) {
        return 'نحن نوفر خدمة الشحن والتوصيل إلى <b>جميع المحافظات</b> داخل مصر 🇪🇬.';
    }
    else if (q.includes('مدة التوصيل') || q.includes('يوصل في قد ايه') || q.includes('كام يوم') || q.includes('وقت الشحن')) {
        return 'مدة التوصيل تستغرق من <b>٥ أيام إلى ١٠ أيام</b> عمل ليصلك الطلب حتى باب البيت 🚚.';
    }

    // 2. استفسارات سريعة ومخصصة لقطع الغيار (تروس، سوست، كراسي)
    else if (q.includes('سوست') || q.includes('سوستين')) {
        return 'المتوفر لدينا من السوست: سوست وقطع غيار أصلية بتبدأ من أسعار مناسبة لكل أنواع العجل ⚙️.';
    }
    else if (q.includes('ترس') || q.includes('تروس')) {
        return 'المتوفر من التروس: طقم تروس خلفي 7 سرعات بسعر <b>150 ج.م</b>، وترس وكرنك 400 بسعر <b>200 ج.م</b> ⚙️.';
    }
    else if (q.includes('كرسي') || q.includes('كراسي')) {
        return 'المتوفر من الكراسي:<br>- كرسي أطفال: <b>70 ج.م</b><br>- كرسي بإشارة: <b>100 ج.م</b><br>- كرسي طبي: <b>150 ج.م</b><br>- كرسي نيجر: <b>150 ج.م</b><br>- كرسي جيل نور خلفي: <b>180 ج.م</b> 🪑';
    }

    // 3. استفسارات العجل والدراجات بأسمائها وأسعارها
    else if (q.includes('جبلية') || q.includes('مساعدين')) {
        return 'عجلة جبلية مساعدين مقاس 26 سعرها <b>6500 ج.م</b> 🚲.';
    }
    else if (q.includes('فولكينو 26') || q.includes('26 فولكينو')) {
        return 'عجلة 26 فولكينو سعرها <b>5000 ج.م</b> 🚲.';
    }
    else if (q.includes('ليكن')) {
        return 'عجلة ليكن سرعات 26 سعرها <b>5000 ج.م</b> 🚲.';
    }
    else if (q.includes('فولكينو 16') || q.includes('16 volcano')) {
        return 'عجلة 16 volcano (حمالة وسلة أطفال) سعرها <b>2500 ج.م</b> 🚲.';
    }
    else if (q.includes('فولكينو 12') || q.includes('12 volcano')) {
        return 'عجلة 12 volcano (حمالة وسلة أطفال) سعرها <b>2300 ج.م</b> 🚲.';
    }
    else if (q.includes('فولكينو 20') || q.includes('20 volcano')) {
        return 'عجلة 20 volcano (سلة وحمالة أطفال) سعرها <b>2800 ج.م</b> 🚲.';
    }
    else if (q.includes('ريس روكيت') || q.includes('روكيت')) {
        return 'عجلة 20 ريس روكيت أطفال سعرها <b>2700 ج.م</b> 🚲.';
    }
    else if (q.includes('عجلة سوري') || q.includes('عجله سوري')) {
        return 'عجلة سوري أطفال سعرها <b>700 ج.م</b> 🚲.';
    }
    else if (q.includes('عربيه سوري') || q.includes('عربية سوري')) {
        return 'عربية سوري أطفال سعرها <b>1000 ج.م</b> 🚗.';
    }
    else if (q.includes('منجده') || q.includes('منجدة')) {
        return 'عجلة منجدة أطفال سعرها <b>500 ج.م</b> 🚲.';
    }
    else if (q.includes('فيجوري') || q.includes('بلاستك فيجوري')) {
        return 'عجلة بلاستك فيجوري أطفال سعرها <b>600 ج.م</b> 🚲.';
    }
    else if (q.includes('حصان') || q.includes('هزاز')) {
        return 'حصان 2 في 1 هزاز سعره <b>600 ج.م</b> 🎠، وكرسي هزاز 3 مستويات بـ <b>500 ج.م</b>.';
    }
    else if (q.includes('نيجر حركات')) {
        return 'عجلة 20 نيجر حركات BMX سعرها <b>5000 ج.م</b> 🚲.';
    }
    else if (q.includes('نيجر المونيا') || q.includes('نيجر ألمونيا')) {
        return 'عجلة 20 نيجر المونيا BMX سعرها <b>5500 ج.م</b> 🚲.';
    }

    // 4. استفسارات الإسكوترات وأسعارها
    else if (q.includes('اسكوتر كبير') || q.includes('إسكوتر كبير') || q.includes('كهربائي كبير')) {
        return 'اسكوتر كهربائي كبير سعره <b>50000 ج.م</b> 🛵.';
    }
    else if (q.includes('rose') || q.includes('روز') || q.includes('هجومي')) {
        return 'اسكوتر Rose الهجومي سعره <b>40000 ج.م</b> 🛵.';
    }
    else if (q.includes('اسكوتر صغير') || q.includes('إسكوتر صغير') || q.includes('بشبكة')) {
        return 'اسكوتر صغير بشبكة سعره <b>20000 ج.م</b> 🛵.';
    }

    // 5. استفسارات تفصيلية لباقي قطع الغيار
    else if (q.includes('تيوبلس') || q.includes('إطار سكوتر') || q.includes('كاوتش سكوتر')) {
        return 'إطار تيوبلس إسكوتر كهربائي سعره <b>2000 ج.م</b> 🛵.';
    }
    else if (q.includes('تروس خلفي') || q.includes('7 سرعات')) {
        return 'طقم تروس خلفي 7 سرعات سعره <b>150 ج.م</b> ⚙️.';
    }
    else if (q.includes('اكس 15') || q.includes('أكس 15')) {
        return 'اكس 15 بدون وردة سعره <b>20 ج.م</b> ⚙️.';
    }
    else if (q.includes('قلب بدال عاده') || q.includes('قلب عادة')) {
        return 'قلب بدال عادة سعره <b>70 ج.م</b> ⚙️.';
    }
    else if (q.includes('قلب بدال الماني') || q.includes('قلب ألماني')) {
        return 'قلب بدال ألماني سعره <b>150 ج.م</b> ⚙️.';
    }
    else if (q.includes('رقبة نيجر') || q.includes('رقبه نيجر')) {
        return 'رقبة نيجر المونيا سعرها <b>150 ج.م</b> ⚙️.';
    }
    else if (q.includes('قفل خرطوم بزرار') || q.includes('قفل بزرار')) {
        return 'قفل خرطوم بزرار سعره <b>150 ج.م</b> 🔒.';
    }
    else if (q.includes('قفل خرطوم عاده') || q.includes('قفل عادة')) {
        return 'قفل خرطوم عادة سعره <b>100 ج.م</b> 🔒.';
    }
    else if (q.includes('كوبيات')) {
        return 'كوبيات نيجر المونيا سعرها <b>150 ج.م</b> ⚙️.';
    }
    else if (q.includes('جنزير')) {
        return 'جنزير سرعات سعره <b>100 ج.م</b> ⚙️.';
    }
    else if (q.includes('سناده نور') || q.includes('سنادة نور')) {
        return 'جوز سنادة نور سعره <b>150 ج.م</b> 💡.';
    }
    else if (q.includes('كفه') || q.includes('كفة')) {
        return 'جوز كفة حديد بـ <b>150 ج.م</b>، وجوز كفة بلاستيك بـ <b>60 ج.م</b> ⚙️.';
    }
    else if (q.includes('صرر') || q.includes('صرة')) {
        return 'الصرر لجميع المقاسات سعرها <b>80 ج.م</b> ⚙️.';
    }
    else if (q.includes('سرينه 8') || q.includes('سرينة 8')) {
        return 'سرينة 8 صوت سعرها <b>150 ج.م</b> 🔊.';
    }
    else if (q.includes('عصفوره') || q.includes('عصفورة')) {
        return 'سرينة عصفورة سعرها <b>80 ج.م</b> 🔊.';
    }
    else if (q.includes('ظرف فورش')) {
        return 'ظرف فورش سعره <b>50 ج.م</b> ⚙️.';
    }
    else if (q.includes('يد نيجر')) {
        return 'يد نيجر سعرها <b>50 ج.م</b> ⚙️.';
    }
    else if (q.includes('جشمة') || q.includes('جشمه')) {
        return 'جشمة سرعات خلفي سعرها <b>100 ج.م</b> ⚙️.';
    }
    else if (q.includes('ترس وكرنك') || q.includes('كرنك 400')) {
        return 'ترس وكرنك 400 سعره <b>200 ج.م</b> ⚙️.';
    }
    else if (q.includes('اكسسوارات عجل') || q.includes('إكسسوارات عجل') || q.includes('قطع غيار')) {
        return 'متوفر لدينا تشكيلة كاملة من قطع الغيار والإكسسوارات (تروس، سوست، كراسي، أقفال، سرينات) بتبدأ من <b>20 ج.م</b> 🚲.';
    }

    // 6. استفسارات عامة عن الأسعار والمكان والتواصل
    else if (q.includes('سعر') || q.includes('أسعار') || q.includes('بكام') || q.includes('تكلفة')) {
        return 'الأسعار في المتجر بتبدأ من 20 ج.م لقطع الغيار، والأطفال بتبدأ من 500 ج.م، والعجل الكبار من 2500 ج.م حتى 6500 ج.م، والإسكوترات من 20,000 ج.م حتى 50,000 ج.م. اكتب لي اسم المنتج وسأجيبك بسعره فوراً! 🚲';
    } 
    else if (q.includes('عجل') || q.includes('دراجة') || q.includes('جبلي') || q.includes('road') || q.includes('bmx')) {
        return 'متوفر عجل جبلية (6500 ج.م / 5000 ج.م)، سرعات، أطفال (من 500 ج.م لـ 2800 ج.م)، ونيجر BMX (من 5000 ج.م لـ 5500 ج.م). تصفح الموقع لمعاينتها بالكامل! 👍';
    }
    else if (q.includes('إسكوتر') || q.includes('سكوتر') || q.includes('اسكوتر')) {
        return 'متوفر إسكوتر كهربائي كبير (50,000 ج.م)، إسكوتر Rose (40,000 ج.م)، وإسكوتر صغير بشبكة (20,000 ج.م) 🛵.';
    }
    else if (q.includes('مكان') || q.includes('عنوان') || q.includes('فين') || q.includes('المحل')) {
        return 'محل <b>إكسسوار آدم</b> موجود في <b>الفيوم</b>، ومتخصص في بيع الدراجات الهوائية، الإسكوترات، وقطع الغيار الأصلية 📍.';
    }
    else if (q.includes('تواصل') || q.includes('رقم') || q.includes('اتصال') || q.includes('واتساب') || q.includes('كلمك')) {
        return 'تقدر تتواصل معانا مباشرة عبر الواتساب على رقمنا: <b>+201029290236</b> وهنرد عليك في أقرب وقت! 📱';
    }
    else if (q.includes('شحن') || q.includes('توصيل') || q.includes('ديليفري')) {
        return 'متاح الشحن والتوصيل لجميع المحافظات بتكلفة <b>١٥٠ ج.م</b> ومدة توصيل من <b>٥ إلى ١٠ أيام</b> 🚀.';
    }
    else if (q.includes('السلام') || q.includes('ازيك') || q.includes('مرحبا') || q.includes('اهلاً') || q.includes('أهلاً')) {
        return 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك في متجر إكسسوار آدم! اسألني عن أي منتج، مواعيد العمل، الشحن، أو خدمات الضمان والصيانة وستجد إجابة فورية 😊.';
    }
    else {
        return 'عذراً، مش متأكد من فهم سؤالك بدقة 😅. تقدر تسألني عن الأسعار، الشحن (المحافظات وتكلفته ومدة التوصيل)، الضمان، الاستبدال خلال ٢٤ ساعة، أو تتواصل معانا على الواتساب <b>+201029290236</b>!';
    }
}