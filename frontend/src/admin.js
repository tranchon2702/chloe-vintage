import "./admin.css";
import { defaultContent } from "./content.js";
import { config } from "./config.js";

const TOKEN_KEY = "chloe-admin-token";

const groups = [
  {
    id: "general",
    number: "01",
    label: "Tổng quan & SEO",
    kicker: "Nội dung website",
    description: "Chỉnh tiêu đề tìm kiếm, thông tin liên hệ và các nội dung dùng chung.",
    prefixes: ["meta.", "brand.", "nav.", "footer.", "accessibility.", "toast."],
  },
  {
    id: "hero",
    number: "02",
    label: "Trang mở đầu",
    kicker: "Folio 00 · Hero",
    description: "Thông điệp đầu tiên, lời giới thiệu và các nút kêu gọi hành động.",
    prefixes: ["hero."],
  },
  {
    id: "manifesto",
    number: "03",
    label: "Quan điểm",
    kicker: "Folio 01 · Manifesto",
    description: "Quan điểm cá nhân và cách Chloe nhìn về kết nối trong sales.",
    prefixes: ["manifesto."],
  },
  {
    id: "approach",
    number: "04",
    label: "Cách làm việc",
    kicker: "Folio 02 · Approach",
    description: "Ba nguyên tắc mô tả cách Chloe làm việc với khách hàng và đối tác.",
    prefixes: ["approach."],
  },
  {
    id: "organic",
    number: "05",
    label: "Giá trị bán hàng",
    kicker: "Folio 03 · Creating value",
    description: "Cách Chloe lắng nghe nhu cầu, hiểu giải pháp, truyền đạt giá trị và xây dựng niềm tin.",
    prefixes: ["organic."],
  },
  {
    id: "cases",
    number: "06",
    label: "Tình huống sales",
    kicker: "Folio 04 · Field notes",
    description:
      "Chỉnh phần giới thiệu và quản lý các tình huống thể hiện cách Chloe suy nghĩ khi làm sales.",
    special: "cases",
  },
  {
    id: "journey",
    number: "07",
    label: "Những chuyến đi",
    kicker: "Folio 05 · Journey",
    description: "Nội dung về trải nghiệm, chuyến đi và những ghi chú cá nhân.",
    prefixes: ["journey."],
  },
  {
    id: "archive",
    number: "08",
    label: "Nhật ký hình ảnh",
    kicker: "Folio 06 · Archive",
    description: "Tiêu đề, lời dẫn, chú thích và mô tả thay thế cho từng ảnh.",
    prefixes: ["archive."],
  },
  {
    id: "about",
    number: "09",
    label: "Về Chloe",
    kicker: "Folio 07 · About",
    description: "Tiểu sử ngắn, tính cách, công việc và các thông tin nổi bật.",
    prefixes: ["about."],
  },
  {
    id: "notes",
    number: "10",
    label: "Ghi chép riêng",
    kicker: "Folio 08 · Notes",
    description: "Ba ghi chép ngắn thể hiện góc nhìn và cá tính của Chloe.",
    prefixes: ["notes."],
  },
  {
    id: "contact",
    number: "11",
    label: "Liên hệ",
    kicker: "Folio 09 · Contact",
    description: "Thông điệp liên hệ, trạng thái sẵn sàng và nội dung biểu mẫu.",
    prefixes: ["contact."],
  },
  {
    id: "visibility",
    number: "12",
    label: "Ẩn / hiện nội dung",
    kicker: "Cấu trúc trang",
    description: "Tạm ẩn một phần khỏi website mà không làm mất nội dung đã nhập.",
    special: "visibility",
  },
  {
    id: "images",
    number: "13",
    label: "Thư viện ảnh",
    kicker: "Hình ảnh website",
    description: "Đổi ảnh cho từng vị trí. Hỗ trợ JPG, PNG, WebP, tối đa 8 MB.",
    special: "images",
  },
];

const fullLabels = {
  "meta.title": "Tiêu đề trang (SEO)",
  "meta.description": "Mô tả trang (SEO)",
  "brand.issue": "Dòng mô tả dưới logo",
  "accessibility.skip": "Nhãn bỏ qua điều hướng",
  "accessibility.menu": "Nhãn mở menu",
  "hero.role": "Vai trò / chuyên môn",
  "hero.lineOne": "Tiêu đề — dòng 1",
  "hero.lineTwo": "Tiêu đề — dòng 2",
  "hero.ctaWork": "Nút xem cách làm việc",
  "hero.ctaContact": "Liên kết liên hệ",
  "hero.imageAlt": "Mô tả ảnh cho người khiếm thị",
  "hero.focus": "Dòng nhấn về ngành hàng",
  "journey.imageAlt": "Mô tả ảnh cho người khiếm thị",
  "cases.disclaimer": "Ghi chú về tình huống giả định",
  "contact.email": "Nhãn nút viết email",
  "contact.copy": "Nhãn nút sao chép email",
  "footer.line": "Dòng giới thiệu ở chân trang",
  "footer.back": "Liên kết về đầu trang",
  "toast.copied": "Thông báo sau khi sao chép email",
};

const wordLabels = {
  label: "Nhãn mục",
  eyebrow: "Dòng dẫn",
  kicker: "Dòng dẫn ngắn",
  title: "Tiêu đề",
  intro: "Lời giới thiệu",
  lead: "Đoạn mở đầu",
  body: "Nội dung",
  bodyOne: "Nội dung — đoạn 1",
  bodyTwo: "Nội dung — đoạn 2",
  lineOne: "Tiêu đề — dòng 1",
  lineTwo: "Tiêu đề — dòng 2",
  captionOne: "Chú thích — dòng 1",
  captionTwo: "Chú thích — dòng 2",
  qualityOne: "Giá trị 1",
  qualityTwo: "Giá trị 2",
  qualityThree: "Giá trị 3",
  noteOne: "Ghi chú 1",
  noteTwo: "Ghi chú 2",
  noteThree: "Ghi chú 3",
  noteFour: "Ghi chú 4",
  availability: "Trạng thái sẵn sàng",
  focus: "Dòng nhấn",
  challenge: "Bối cảnh",
  approach: "Cách tiếp cận",
  outcome: "Kết quả mong muốn",
  disclaimer: "Ghi chú",
  imageAlt: "Mô tả ảnh",
  plant: "Chú thích ảnh bàn",
  plantAlt: "Mô tả ảnh bàn",
  reading: "Chú thích ảnh đọc sách",
  readingAlt: "Mô tả ảnh đọc sách",
  travel: "Chú thích ảnh chuyến đi",
  travelAlt: "Mô tả ảnh chuyến đi",
  cover: "Chú thích ảnh chân dung",
  coverAlt: "Mô tả ảnh chân dung",
  denimOne: "Chú thích ảnh denim 1",
  denimOneAlt: "Mô tả ảnh denim 1",
  denimTwo: "Chú thích ảnh denim 2",
  denimTwoAlt: "Mô tả ảnh denim 2",
  name: "Tên",
  namePlaceholder: "Gợi ý ô tên",
  email: "Email",
  emailPlaceholder: "Gợi ý ô email",
  subject: "Chủ đề",
  subjectPlaceholder: "Gợi ý ô chủ đề",
  message: "Lời nhắn",
  messagePlaceholder: "Gợi ý ô lời nhắn",
  submit: "Nút gửi",
  sending: "Trạng thái đang gửi",
  success: "Thông báo gửi thành công",
  error: "Thông báo gửi thất bại",
  value: "Nội dung",
};

const collectionLabels = {
  one: "Mục 1",
  two: "Mục 2",
  three: "Mục 3",
  four: "Mục 4",
  factOne: "Thông tin 1",
  factTwo: "Thông tin 2",
  factThree: "Thông tin 3",
  factFour: "Thông tin 4",
  form: "Biểu mẫu",
};

const visibilityLabels = {
  manifesto: ["Quan điểm", "Phần giới thiệu góc nhìn cá nhân"],
  approach: ["Cách làm việc", "Ba nguyên tắc sales"],
  organic: ["Giá trị bán hàng", "Từ thấu hiểu nhu cầu đến một lựa chọn phù hợp"],
  cases: ["Tình huống sales", "Các tình huống giả định thể hiện cách suy nghĩ"],
  journey: ["Những chuyến đi", "Trải nghiệm và ghi chú cá nhân"],
  archive: ["Nhật ký hình ảnh", "Bộ sưu tập sáu ảnh"],
  about: ["Về Chloe", "Tiểu sử và thông tin nổi bật"],
  notes: ["Ghi chép riêng", "Ba ghi chú ngắn"],
  contact: ["Liên hệ", "Thông tin email và biểu mẫu"],
};

const imageSlots = [
  ["hero", "hero", "Ảnh bìa cho video Hero", "Dùng làm poster khi video chưa phát"],
  ["journey", "journey", "Ảnh lifestyle", "Ảnh dọc, gợi ý tỷ lệ 3:4"],
  ["archivePlant", "archive-plant", "Nhật ký · Studio 01", "Ảnh mục 01"],
  ["archiveReading", "archive-reading", "Nhật ký · Film 02", "Ảnh mục 02"],
  ["archiveTravel", "archive-travel", "Nhật ký · Neon 03", "Ảnh mục 03"],
  ["archiveCover", "archive-cover", "Nhật ký · Chân dung 04", "Ảnh mục 04"],
  ["archiveDenimOne", "archive-denim-one", "Nhật ký · Vòm lá 05", "Ảnh mục 05"],
  ["archiveDenimTwo", "archive-denim-two", "Nhật ký · Hiệu sách 06", "Ảnh mục 06"],
  ["social", "social", "Ảnh chia sẻ mạng xã hội", "Ảnh sẽ được nền tảng tự crop khi chia sẻ"],
];

const loginView = document.querySelector("[data-login-view]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const loginSubmit = document.querySelector("[data-login-submit]");
const dashboard = document.querySelector("[data-dashboard]");
const adminNav = document.querySelector("[data-admin-nav]");
const panelTitle = document.querySelector("[data-panel-title]");
const panelKicker = document.querySelector("[data-panel-kicker]");
const panelDescription = document.querySelector("[data-panel-description]");
const editorPanel = document.querySelector("[data-editor-panel]");
const editorForm = document.querySelector("[data-editor-form]");
const languageTabs = document.querySelector("[data-language-tabs]");
const saveButton = document.querySelector("[data-save]");
const saveLabel = document.querySelector("[data-save-label]");
const saveState = document.querySelector("[data-save-state]");
const saveStateWrapper = saveState.parentElement;
const updatedAtNode = document.querySelector("[data-updated-at]");
const toast = document.querySelector("[data-admin-toast]");
const sidebar = document.querySelector(".sidebar");
const mobileNavToggle = document.querySelector("[data-mobile-nav-toggle]");

let token = sessionStorage.getItem(TOKEN_KEY) || "";
let content = structuredClone(defaultContent);
let activeGroupId = "general";
let language = "vi";
let isDirty = false;
let updatedAt = null;
let toastTimer;

function mergeContent(savedContent) {
  if (!savedContent) return structuredClone(defaultContent);
  return {
    ...structuredClone(defaultContent),
    ...savedContent,
    images: { ...defaultContent.images, ...savedContent.images },
    sections: { ...defaultContent.sections, ...savedContent.sections },
    caseStudies: Array.isArray(savedContent.caseStudies)
      ? savedContent.caseStudies
      : structuredClone(defaultContent.caseStudies),
    translations: {
      vi: { ...defaultContent.translations.vi, ...savedContent.translations?.vi },
      en: { ...defaultContent.translations.en, ...savedContent.translations?.en },
    },
  };
}

async function request(path, options = {}) {
  const isBinary = options.body instanceof Blob;
  const response = await fetch(`${config.apiPrefix}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.body && !isBinary ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== "/admin/login") {
      token = "";
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(payload?.message || "Không thể hoàn tất yêu cầu.");
  }
  return payload?.data;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function showLogin(message = "") {
  dashboard.hidden = true;
  loginView.hidden = false;
  loginMessage.textContent = message;
  document.querySelector("#admin-password")?.focus();
}

function showDashboard() {
  loginView.hidden = true;
  dashboard.hidden = false;
}

function setDirty(value = true) {
  isDirty = value;
  saveButton.disabled = !value;
  saveState.textContent = value ? "Có thay đổi chưa lưu" : "Đã đồng bộ";
  saveStateWrapper.classList.toggle("is-dirty", value);
}

function updateTimestamp() {
  updatedAtNode.textContent = updatedAt
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(updatedAt))
    : "Chưa lưu lần nào";
}

function fieldLabel(key) {
  if (fullLabels[key]) return fullLabels[key];
  const parts = key.split(".");
  const tail = parts.at(-1);
  const parent = parts.at(-2);
  const parentLabel = collectionLabels[parent];
  const tailLabel = wordLabels[tail] || tail;
  return parentLabel ? `${parentLabel} · ${tailLabel}` : tailLabel;
}

function shouldUseTextarea(key, value) {
  return (
    value.length > 82 ||
    /(body|intro|lead|description|quote|message|success|error)$/i.test(key)
  );
}

function createHeading(title, description) {
  const wrapper = document.createElement("div");
  wrapper.className = "editor-section-heading";
  const heading = document.createElement("h2");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.textContent = description;
  wrapper.append(heading, copy);
  return wrapper;
}

function renderTextFields(group) {
  const dictionary = content.translations[language];
  const keys = Object.keys(dictionary).filter((key) =>
    group.prefixes.some((prefix) => key.startsWith(prefix)),
  );

  if (group.id === "general") {
    editorPanel.append(
      createHeading("Thông tin chung", "Email này được dùng cho nút liên hệ và sao chép email."),
    );
    editorPanel.append(createField("email", "Email nhận liên hệ", content.email, true));
    editorPanel.append(
      createHeading(
        language === "vi" ? "Nội dung tiếng Việt" : "English content",
        "Các thay đổi dưới đây chỉ áp dụng cho ngôn ngữ đang chọn.",
      ),
    );
  }

  keys.forEach((key) => {
    editorPanel.append(createField(key, fieldLabel(key), dictionary[key]));
  });
}

function createField(key, label, value, isGlobal = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "content-field";
  const heading = document.createElement("div");
  heading.className = "field-heading";
  const fieldId = `field-${language}-${key.replaceAll(".", "-")}`;
  const labelNode = document.createElement("label");
  labelNode.htmlFor = fieldId;
  labelNode.textContent = label;
  const code = document.createElement("code");
  code.textContent = isGlobal ? "dùng chung" : key;
  heading.append(labelNode, code);

  const isTextarea = !isGlobal && shouldUseTextarea(key, value);
  const input = document.createElement(isTextarea ? "textarea" : "input");
  input.id = fieldId;
  input.name = key;
  input.value = value;
  input.required = true;
  input.maxLength = isGlobal ? 160 : 5000;
  if (isGlobal) input.type = "email";
  if (isTextarea) input.rows = Math.min(7, Math.max(3, Math.ceil(value.length / 85)));

  const foot = document.createElement("div");
  foot.className = "field-foot";
  const counter = document.createElement("span");
  counter.textContent = `${value.length} / ${input.maxLength}`;
  foot.append(counter);

  input.addEventListener("input", () => {
    if (isGlobal) {
      content.email = input.value;
    } else {
      content.translations[language][key] = input.value;
    }
    counter.textContent = `${input.value.length} / ${input.maxLength}`;
    setDirty();
  });

  wrapper.append(heading, input, foot);
  return wrapper;
}

function createCaseField(study, index, property, label, maxLength) {
  const value = study[language][property];
  const wrapper = document.createElement("div");
  wrapper.className = "content-field case-editor-field";
  const heading = document.createElement("div");
  heading.className = "field-heading";
  const fieldId = `case-${study.id}-${language}-${property}`;
  const labelNode = document.createElement("label");
  labelNode.htmlFor = fieldId;
  labelNode.textContent = label;
  const code = document.createElement("code");
  code.textContent = `${language} · ${property}`;
  heading.append(labelNode, code);

  const multiline = ["challenge", "approach", "outcome"].includes(property);
  const input = document.createElement(multiline ? "textarea" : "input");
  input.id = fieldId;
  input.name = `caseStudies.${index}.${language}.${property}`;
  input.value = value;
  input.required = true;
  input.maxLength = maxLength;
  if (multiline) input.rows = property === "approach" ? 5 : 3;

  const foot = document.createElement("div");
  foot.className = "field-foot";
  const counter = document.createElement("span");
  counter.textContent = `${value.length} / ${maxLength}`;
  foot.append(counter);

  input.addEventListener("input", () => {
    study[language][property] = input.value;
    counter.textContent = `${input.value.length} / ${maxLength}`;
    setDirty();
  });

  wrapper.append(heading, input, foot);
  return wrapper;
}

function renderCaseStudiesEditor() {
  const dictionary = content.translations[language];
  editorPanel.append(
    createHeading(
      language === "vi" ? "Phần giới thiệu" : "Section introduction",
      "Các nhãn và lời dẫn dưới đây áp dụng cho ngôn ngữ đang chọn.",
    ),
  );
  Object.keys(dictionary)
    .filter((key) => key.startsWith("cases."))
    .forEach((key) => editorPanel.append(createField(key, fieldLabel(key), dictionary[key])));

  editorPanel.append(
    createHeading(
      language === "vi" ? "Danh sách tình huống" : "Scenario list",
      "Mỗi tình huống có nội dung Việt/Anh riêng. Bạn có thể thêm, xóa hoặc đổi thứ tự hiển thị.",
    ),
  );

  const list = document.createElement("div");
  list.className = "case-editor-list";

  content.caseStudies.forEach((study, index) => {
    const card = document.createElement("article");
    card.className = "case-editor-card";

    const header = document.createElement("header");
    const title = document.createElement("div");
    const folio = document.createElement("span");
    folio.textContent = `CASE ${String(index + 1).padStart(2, "0")}`;
    const heading = document.createElement("h3");
    heading.textContent = study[language].title;
    title.append(folio, heading);

    const actions = document.createElement("div");
    actions.className = "case-editor-actions";
    [
      ["↑", "Đưa lên", index === 0, -1],
      ["↓", "Đưa xuống", index === content.caseStudies.length - 1, 1],
    ].forEach(([symbol, ariaLabel, disabled, offset]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = symbol;
      button.title = ariaLabel;
      button.setAttribute("aria-label", ariaLabel);
      button.disabled = disabled;
      button.addEventListener("click", () => {
        const [item] = content.caseStudies.splice(index, 1);
        content.caseStudies.splice(index + offset, 0, item);
        setDirty();
        renderPanel();
      });
      actions.append(button);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "case-editor-remove";
    remove.textContent = "Xóa";
    remove.addEventListener("click", () => {
      if (!window.confirm(`Xóa tình huống “${study[language].title}”?`)) return;
      content.caseStudies.splice(index, 1);
      setDirty();
      renderPanel();
    });
    actions.append(remove);
    header.append(title, actions);

    const fields = document.createElement("div");
    fields.className = "case-editor-fields";
    [
      ["eyebrow", "Dòng dẫn", 100],
      ["title", "Tiêu đề", 220],
      ["challenge", "Bối cảnh / nhu cầu", 1200],
      ["approach", "Cách tiếp cận", 1800],
      ["outcome", "Kết quả mong muốn", 1200],
    ].forEach(([property, label, maxLength]) => {
      fields.append(createCaseField(study, index, property, label, maxLength));
    });
    card.append(header, fields);
    list.append(card);
  });

  if (!content.caseStudies.length) {
    const empty = document.createElement("p");
    empty.className = "case-editor-empty";
    empty.textContent = "Chưa có tình huống nào. Thêm một tình huống để bắt đầu.";
    list.append(empty);
  }

  const add = document.createElement("button");
  add.type = "button";
  add.className = "case-editor-add";
  add.disabled = content.caseStudies.length >= 8;
  add.textContent =
    content.caseStudies.length >= 8 ? "Đã đạt tối đa 8 tình huống" : "＋ Thêm tình huống";
  add.addEventListener("click", () => {
    const id = `case-${Date.now()}`;
    content.caseStudies.push({
      id,
      vi: {
        eyebrow: "Tình huống mới",
        title: "Tiêu đề tình huống mới",
        challenge: "Mô tả bối cảnh hoặc nhu cầu của khách hàng.",
        approach: "Mô tả cách lắng nghe, đặt câu hỏi và đề xuất hướng giải quyết.",
        outcome: "Mô tả kết quả mong muốn hoặc giá trị mang lại.",
      },
      en: {
        eyebrow: "New scenario",
        title: "New scenario title",
        challenge: "Describe the customer context or need.",
        approach: "Describe how you would listen, ask questions and shape a fitting direction.",
        outcome: "Describe the intended outcome or value created.",
      },
    });
    setDirty();
    renderPanel();
  });

  editorPanel.append(list, add);
}

function renderVisibility() {
  editorPanel.append(
    createHeading(
      "Các phần đang hiển thị",
      "Nội dung vẫn được giữ nguyên khi tắt và sẽ trở lại khi bật lại.",
    ),
  );
  const list = document.createElement("div");
  list.className = "visibility-list";

  Object.entries(visibilityLabels).forEach(([key, [title, description]]) => {
    const row = document.createElement("div");
    row.className = "visibility-row";
    const copy = document.createElement("div");
    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    const descriptionNode = document.createElement("small");
    descriptionNode.textContent = description;
    copy.append(titleNode, descriptionNode);

    const label = document.createElement("label");
    label.className = "switch";
    label.setAttribute("aria-label", `Hiển thị ${title}`);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = content.sections[key];
    const visual = document.createElement("span");
    checkbox.addEventListener("change", () => {
      content.sections[key] = checkbox.checked;
      setDirty();
    });
    label.append(checkbox, visual);
    row.append(copy, label);
    list.append(row);
  });
  editorPanel.append(list);
}

function renderImages() {
  editorPanel.append(
    createHeading(
      "Hình ảnh đang sử dụng",
      "Ảnh mới được tải lên ngay; bấm “Lưu thay đổi” để áp dụng ảnh đó cho website.",
    ),
  );
  const grid = document.createElement("div");
  grid.className = "image-grid";

  imageSlots.forEach(([key, apiSlot, title, hint]) => {
    const card = document.createElement("article");
    card.className = "image-card";
    card.dataset.slot = key;
    const preview = document.createElement("div");
    preview.className = "image-preview";
    const image = document.createElement("img");
    image.src = content.images[key];
    image.alt = "";
    preview.append(image);

    const body = document.createElement("div");
    body.className = "image-card-body";
    const heading = document.createElement("div");
    heading.className = "image-card-heading";
    const copy = document.createElement("div");
    const titleNode = document.createElement("h3");
    titleNode.textContent = title;
    const hintNode = document.createElement("p");
    hintNode.textContent = hint;
    copy.append(titleNode, hintNode);
    const path = document.createElement("code");
    path.textContent = content.images[key];
    heading.append(copy);

    const actions = document.createElement("div");
    actions.className = "image-actions";
    const uploadLabel = document.createElement("label");
    uploadLabel.className = "upload-button";
    uploadLabel.textContent = "Chọn ảnh mới";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/png,image/webp";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      await uploadImage({ key, apiSlot, file, image, path, uploadLabel });
      fileInput.value = "";
    });
    uploadLabel.append(fileInput);

    const reset = document.createElement("button");
    reset.className = "reset-image-button";
    reset.type = "button";
    reset.textContent = "Dùng ảnh gốc";
    reset.disabled = content.images[key] === defaultContent.images[key];
    reset.addEventListener("click", () => {
      content.images[key] = defaultContent.images[key];
      image.src = defaultContent.images[key];
      path.textContent = defaultContent.images[key];
      reset.disabled = true;
      setDirty();
    });
    actions.append(uploadLabel, reset);
    body.append(heading, path, actions);
    card.append(preview, body);
    grid.append(card);
  });
  editorPanel.append(grid);
}

async function uploadImage({ key, apiSlot, file, image, path, uploadLabel }) {
  if (file.size > 8 * 1024 * 1024) {
    showToast("Ảnh lớn hơn 8 MB. Vui lòng chọn ảnh nhẹ hơn.");
    return;
  }

  const originalLabel = uploadLabel.firstChild.textContent;
  uploadLabel.firstChild.textContent = "Đang tải…";
  try {
    const result = await request(`/admin/media/${apiSlot}`, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });
    content.images[key] = result.path;
    image.src = result.path;
    path.textContent = result.path;
    uploadLabel.closest(".image-card").querySelector(".reset-image-button").disabled = false;
    setDirty();
    showToast("Đã tải ảnh lên. Hãy lưu thay đổi để áp dụng.");
  } catch (error) {
    showToast(error.message);
  } finally {
    uploadLabel.firstChild.textContent = originalLabel;
  }
}

function renderPanel() {
  const group = groups.find(({ id }) => id === activeGroupId) || groups[0];
  panelTitle.textContent = group.label;
  panelKicker.textContent = group.kicker;
  panelDescription.textContent = group.description;
  languageTabs.hidden = ["visibility", "images"].includes(group.special);
  editorPanel.replaceChildren();

  adminNav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.group === activeGroupId);
  });

  if (group.special === "visibility") {
    renderVisibility();
  } else if (group.special === "images") {
    renderImages();
  } else if (group.special === "cases") {
    renderCaseStudiesEditor();
  } else {
    renderTextFields(group);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderNavigation() {
  adminNav.replaceChildren();
  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.group = group.id;
    const number = document.createElement("span");
    number.textContent = group.number;
    const label = document.createElement("strong");
    label.textContent = group.label;
    button.append(number, label);
    button.addEventListener("click", () => {
      activeGroupId = group.id;
      sidebar.classList.remove("is-open");
      mobileNavToggle.setAttribute("aria-expanded", "false");
      renderPanel();
    });
    adminNav.append(button);
  });
}

async function loadDashboard() {
  try {
    const document = await request("/admin/content", { method: "GET" });
    content = mergeContent(document?.content);
    updatedAt = document?.updatedAt;
    setDirty(false);
    updateTimestamp();
    renderNavigation();
    renderPanel();
    showDashboard();
  } catch (error) {
    if (token) showToast(error.message);
  }
}

async function saveContent() {
  if (!editorForm.reportValidity()) return;
  saveButton.disabled = true;
  saveLabel.textContent = "Đang lưu…";
  try {
    const document = await request("/admin/content", {
      method: "PUT",
      body: JSON.stringify(content),
    });
    content = mergeContent(document.content);
    updatedAt = document.updatedAt;
    updateTimestamp();
    setDirty(false);
    showToast("Đã lưu và cập nhật website.");
  } catch (error) {
    saveButton.disabled = false;
    showToast(error.message);
  } finally {
    saveLabel.textContent = "Lưu thay đổi";
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginSubmit.disabled = true;
  loginMessage.textContent = "";
  const password = new FormData(loginForm).get("password");
  try {
    const session = await request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    token = session.token;
    sessionStorage.setItem(TOKEN_KEY, token);
    loginForm.reset();
    await loadDashboard();
  } catch (error) {
    loginMessage.textContent =
      error.message === "Incorrect password"
        ? "Mật khẩu chưa đúng. Vui lòng thử lại."
        : error.message;
  } finally {
    loginSubmit.disabled = false;
  }
});

document.querySelector("[data-toggle-password]").addEventListener("click", (event) => {
  const input = document.querySelector("#admin-password");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  event.currentTarget.textContent = show ? "Ẩn" : "Hiện";
});

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    document.querySelectorAll("[data-language]").forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
    });
    renderPanel();
  });
});

saveButton.addEventListener("click", saveContent);

document.querySelector("[data-logout]").addEventListener("click", async () => {
  try {
    await request("/admin/logout", { method: "POST" });
  } catch {
    // A local logout still succeeds when the server session has already expired.
  }
  token = "";
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
});

mobileNavToggle.addEventListener("click", () => {
  const open = !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", open);
  mobileNavToggle.setAttribute("aria-expanded", String(open));
});

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (isDirty) void saveContent();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
});

if (token) {
  void loadDashboard();
} else {
  showLogin();
}
