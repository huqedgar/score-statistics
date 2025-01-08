// Khởi tạo các khoảng điểm mặc định
let belowAverageRanges = [
  "0.0 - 0.3",
  "0.5 - 0.8",
  "1.0 - 1.3",
  "1.5 - 1.8",
  "2.0 - 2.3",
  "2.5 - 2.8",
  "3.0 - 3.3",
  "3.5 - 3.8",
  "4.0 - 4.3",
  "4.5 - 4.8",
];

let aboveAverageRanges = [
  "5.0 - 5.3",
  "5.5 - 5.8",
  "6.0 - 6.3",
  "6.5 - 6.8",
  "7.0 - 7.3",
  "7.5 - 7.8",
  "8.0 - 8.3",
  "8.5 - 8.8",
  "9.0 - 9.3",
  "9.5 - 9.8",
  "10",
];

const scoreCount = {
  belowAverage: {},
  aboveAverage: {},
};

let lastHighlightedCell = null;
const history = [];
const scoreHistory = [];

// Hàm điều khiển hiển thị phần cấu hình
function toggleConfig() {
  const configSection = document.getElementById("configSection");
  const isHidden = configSection.style.display === "none";
  configSection.style.display = isHidden ? "block" : "none";

  if (isHidden) {
    renderRangeInputs();
  }
}

// Hàm tạo input cho từng khoảng điểm
function createRangeInput(range, isAbove) {
  const div = document.createElement("div");
  div.className = "range-input";

  if (range === "10" || !range.includes(" - ")) {
    // Trường hợp điểm đơn
    const value = range === "10" ? "10" : range;
    div.innerHTML = `
            <input type="number" value="${value}" step="0.1" min="0" max="10" style="width: 70px;" />
            <button class="btn-remove-range" onclick="removeRange('${range}', ${isAbove})">×</button>
          `;
  } else {
    // Trường hợp khoảng điểm
    const [min, max] = range.split(" - ");
    div.innerHTML = `
            <input type="number" value="${min}" step="0.1" min="0" max="10" />
            <span>-</span>
            <input type="number" value="${max}" step="0.1" min="0" max="10" />
            <button class="btn-remove-range" onclick="removeRange('${range}', ${isAbove})">×</button>
          `;
  }

  return div;
}

// Hàm render các input khoảng điểm
function renderRangeInputs() {
  const belowContainer = document.getElementById("belowRanges");
  const aboveContainer = document.getElementById("aboveRanges");

  belowContainer.innerHTML = "";
  aboveContainer.innerHTML = "";

  belowAverageRanges.forEach((range) => {
    belowContainer.appendChild(createRangeInput(range, false));
  });

  aboveAverageRanges.forEach((range) => {
    aboveContainer.appendChild(createRangeInput(range, true));
  });
}

// Hàm thêm khoảng điểm mới
function addRange(isAbove, type) {
  const ranges = isAbove ? aboveAverageRanges : belowAverageRanges;
  const newValue = type === "range" ? "0.0 - 0.0" : "0.0";
  ranges.push(newValue);
  renderRangeInputs();
}

// Hàm xóa khoảng điểm
function removeRange(range, isAbove) {
  const ranges = isAbove ? aboveAverageRanges : belowAverageRanges;
  const index = ranges.indexOf(range);
  if (index > -1) {
    ranges.splice(index, 1);
    renderRangeInputs();
  }
}

// Hàm kiểm tra tính hợp lệ của khoảng điểm
function validateRanges(container, isAbove) {
  const rangeInputs = container.getElementsByClassName("range-input");
  const newRanges = [];

  for (let input of rangeInputs) {
    const inputs = input.getElementsByTagName("input");

    if (inputs.length === 1) {
      // Trường hợp điểm đơn
      const value = parseFloat(inputs[0].value);
      if (isNaN(value) || value < 0 || value > 10) {
        alert("Vui lòng kiểm tra lại các giá trị điểm!");
        return null;
      }
      newRanges.push(value.toFixed(1));
      continue;
    }

    // Trường hợp khoảng điểm
    const min = parseFloat(inputs[0].value);
    const max = parseFloat(inputs[1].value);

    if (isNaN(min) || isNaN(max) || min >= max || min < 0 || max > 10) {
      alert("Vui lòng kiểm tra lại các khoảng điểm!");
      return null;
    }

    newRanges.push(`${min.toFixed(1)} - ${max.toFixed(1)}`);
  }

  return newRanges;
}

// Hàm áp dụng cấu hình mới
function applyConfig() {
  const belowRanges = validateRanges(
    document.getElementById("belowRanges"),
    false
  );
  const aboveRanges = validateRanges(
    document.getElementById("aboveRanges"),
    true
  );

  if (!belowRanges || !aboveRanges) return;

  // Kiểm tra khoảng điểm trùng lặp
  const allRanges = [...belowRanges, ...aboveRanges];
  for (let i = 0; i < allRanges.length; i++) {
    for (let j = i + 1; j < allRanges.length; j++) {
      if (allRanges[i] === allRanges[j]) {
        alert("Không được có khoảng điểm trùng lặp!");
        return;
      }
    }
  }

  belowAverageRanges = belowRanges;
  aboveAverageRanges = aboveRanges;

  // Reset dữ liệu và cập nhật bảng
  clearAll();
  toggleConfig();
}

// Hàm điều khiển hiển thị lịch sử
function toggleHistory() {
  const historyList = document.getElementById("historyList");
  historyList.classList.toggle("hidden");
}

// Hàm highlight ô vừa thay đổi
function highlightCell(tableId, range) {
  // Remove previous highlight
  if (lastHighlightedCell) {
    lastHighlightedCell.classList.remove("highlight");
  }

  // Find and highlight new cell
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName("tr");
  for (let row of rows) {
    const cells = row.getElementsByTagName("td");
    if (cells.length > 0 && cells[0].textContent === range) {
      cells[1].classList.add("highlight");
      lastHighlightedCell = cells[1];
      break;
    }
  }
}

// Hàm lưu trạng thái để undo
function saveState() {
  history.push({
    belowAverage: { ...scoreCount.belowAverage },
    aboveAverage: { ...scoreCount.aboveAverage },
  });
  document.getElementById("undoButton").disabled = false;
}

// Hàm khởi tạo bảng
function initializeTables() {
  const belowTableBody = document.querySelector("#belowAverageTable tbody");
  const aboveTableBody = document.querySelector("#aboveAverageTable tbody");

  belowAverageRanges.forEach((range) => {
    const row = createTableRow(range, 0);
    belowTableBody.appendChild(row);
  });
  belowTableBody.appendChild(createTotalRow(0));

  aboveAverageRanges.forEach((range) => {
    const row = createTableRow(range, 0);
    aboveTableBody.appendChild(row);
  });
  aboveTableBody.appendChild(createTotalRow(0));
}

// Hàm tạo hàng trong bảng
function createTableRow(range, count) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${range}</td>
    <td>${count}</td>
  `;
  return row;
}

// Hàm tạo hàng tổng
function createTotalRow(total) {
  const row = document.createElement("tr");
  row.className = "total-row";
  row.innerHTML = `
    <td>Tổng số lượng</td>
    <td>${total}</td>
  `;
  return row;
}

// Hàm kiểm tra điểm có thuộc khoảng không
function isInRange(score, range) {
  if (range === "10" || !range.includes(" - ")) {
    return score === parseFloat(range);
  }
  const [min, max] = range.split(" - ").map(Number);
  return score >= min && score <= max;
}

// Hàm tìm khoảng điểm phù hợp
function findScoreRange(score) {
  const ranges = score < 5 ? belowAverageRanges : aboveAverageRanges;
  return ranges.find((range) => isInRange(score, range));
}

// Hàm thêm vào lịch sử
function addToHistory(score) {
  const range = findScoreRange(score);
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  scoreHistory.unshift({
    score: score,
    range: range,
    time: timeString,
  });
  updateHistoryDisplay();
}

// Hàm cập nhật hiển thị lịch sử
function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  const historyCount = document.getElementById("historyCount");

  historyList.innerHTML = scoreHistory
    .map(
      (item) => `
      <div class="history-item">
        ${item.time} - Điểm: ${item.score} (Khoảng: ${item.range})
      </div>
    `
    )
    .join("");

  historyCount.textContent = `(${scoreHistory.length} điểm)`;
}

// Hàm tính tổng
function calculateTotal(counts) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

// Hàm cập nhật bảng
function updateTable(tableId, ranges, counts) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = "";

  ranges.forEach((range) => {
    const row = createTableRow(range, counts[range] || 0);
    tableBody.appendChild(row);
  });

  const total = calculateTotal(counts);
  tableBody.appendChild(createTotalRow(total));
}

// Hàm thêm điểm
function addScore() {
  const input = document.getElementById("scoreInput");
  const score = parseFloat(input.value);

  if (isNaN(score) || score < 0 || score > 10) {
    alert("Vui lòng nhập điểm hợp lệ từ 0 đến 10");
    return;
  }

  saveState();

  if (score < 5) {
    const range = belowAverageRanges.find((range) => isInRange(score, range));
    if (range) {
      scoreCount.belowAverage[range] =
        (scoreCount.belowAverage[range] || 0) + 1;
      updateTable(
        "belowAverageTable",
        belowAverageRanges,
        scoreCount.belowAverage
      );
      highlightCell("belowAverageTable", range);
    }
  } else {
    const range = aboveAverageRanges.find((range) => isInRange(score, range));
    if (range) {
      scoreCount.aboveAverage[range] =
        (scoreCount.aboveAverage[range] || 0) + 1;
      updateTable(
        "aboveAverageTable",
        aboveAverageRanges,
        scoreCount.aboveAverage
      );
      highlightCell("aboveAverageTable", range);
    }
  }

  addToHistory(score);
  input.value = "";
}

// Hàm hoàn tác
function undoLastScore() {
  if (history.length === 0) return;

  const lastState = history.pop();
  scoreCount.belowAverage = { ...lastState.belowAverage };
  scoreCount.aboveAverage = { ...lastState.aboveAverage };

  updateTable("belowAverageTable", belowAverageRanges, scoreCount.belowAverage);
  updateTable("aboveAverageTable", aboveAverageRanges, scoreCount.aboveAverage);

  if (lastHighlightedCell) {
    lastHighlightedCell.classList.remove("highlight");
    lastHighlightedCell = null;
  }

  if (scoreHistory.length > 0) {
    scoreHistory.shift();
    updateHistoryDisplay();
  }

  document.getElementById("undoButton").disabled = history.length === 0;
}

// Hàm xóa tất cả
function clearAll() {
  if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu?")) {
    saveState();

    scoreCount.belowAverage = {};
    scoreCount.aboveAverage = {};
    scoreHistory.length = 0;

    if (lastHighlightedCell) {
      lastHighlightedCell.classList.remove("highlight");
      lastHighlightedCell = null;
    }

    updateTable(
      "belowAverageTable",
      belowAverageRanges,
      scoreCount.belowAverage
    );
    updateTable(
      "aboveAverageTable",
      aboveAverageRanges,
      scoreCount.aboveAverage
    );
    updateHistoryDisplay();
  }
}

// Khởi tạo khi tải trang
initializeTables();

// Thêm sự kiện Enter cho input
document
  .getElementById("scoreInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addScore();
    }
  });
