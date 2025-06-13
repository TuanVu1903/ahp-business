// Các hàm có trong file js
// biến selectedCriteria, selectedAlternatives lấy từ response trả về từ LLM
// biến criteriaMatrix, alternativeMatrices lấy từ người dùng nhập vào
// hàm displayCriteriaMatrix, displayAlternativeMatrices hiển thị ma trận so sánh cặp tiêu chí và phương án
// hàm calculateAHP tính toán AHP
// hàm calculateWeights tính trọng số từ ma trận so sánh cặp
// hàm checkConsistency kiểm tra độ nhất quán (Consistency Ratio - CR)
// hàm displayFinalResults hiển thị kết quả cuối cùng

// AHP Calculator: Quản lý dữ liệu và logic
const AHPCalculator = {
    // Dữ liệu ban đầu (có thể được cập nhật từ người dùng hoặc LLM)
    data: {
        // Dữ liệu cố định cho bài toán AHP: Chọn điện thoại
        selectedCriteria: ["Price", "Storage", "Camera", "Look"],
        selectedAlternatives: ["Mobile 1", "Mobile 2", "Mobile 3"],
        
        // Ma trận so sánh cặp tiêu chí (cố định từ ví dụ)
        criteriaMatrix: [
            [1, 5, 3, 7],
            [1/5, 1, 1/2, 3],
            [1/3, 2, 1, 5],
            [1/7, 1/3, 1/5, 1]
        ],
        
        // Ma trận so sánh cặp phương án theo từng tiêu chí (cố định từ ví dụ)
        alternativeMatrices: {
            "Price": [
                [1, 3, 4],
                [1/3, 1, 2],
                [1/4, 1/2, 1]
            ],
            "Storage": [
                [1, 1/3, 2],
                [3, 1, 7],
                [1/2, 1/7, 1]
            ],
            "Camera": [
                [1, 3, 1/2],
                [1/3, 1, 1/4],
                [2, 4, 1]
            ],
            "Look": [
                [1, 6, 2],
                [1/6, 1, 1/3],
                [1/2, 3, 1]
            ]
        },
        
        // Kết quả tính toán
        criteriaWeights: [],
        alternativeWeights: {},
        finalScores: {},
    },
    
    // Phương thức khởi tạo
    init: function() {
        this.bindEvents();
        this.updateDisplay();
        this.calculate();
    },
    
    // Gắn các sự kiện
    bindEvents: function() {
        // Nút tính toán AHP
        document.getElementById("calculateButton").addEventListener("click", () => this.calculate());
        
        // Nút cho phép nhập liệu thủ công 
        const manualInputBtn = document.getElementById("manualInputBtn");
        if (manualInputBtn) {
            manualInputBtn.addEventListener("click", () => this.showManualInputForm());
        }
        
        // Nút cho phép sử dụng LLM
        const llmSuggestBtn = document.getElementById("llmSuggestBtn");
        if (llmSuggestBtn) {
            llmSuggestBtn.addEventListener("click", () => this.suggestFromLLM());
        }
        
        // Các nút thêm tiêu chí và phương án
        this.setupDynamicInputs();
    },
    
    // Thiết lập các input động cho việc thêm tiêu chí và phương án
    setupDynamicInputs: function() {
        const addCriterionBtn = document.getElementById("addCriterionBtn");
        const addAlternativeBtn = document.getElementById("addAlternativeBtn");
        
        if (addCriterionBtn) {
            addCriterionBtn.addEventListener("click", () => this.addCriterion());
        }
        
        if (addAlternativeBtn) {
            addAlternativeBtn.addEventListener("click", () => this.addAlternative());
        }
    },
    
    // Hiển thị form nhập liệu thủ công
    showManualInputForm: function() {
        const manualInputSection = document.getElementById("manualInputSection");
        const llmSuggestionSection = document.getElementById("llmSuggestionSection");
        
        if (manualInputSection) manualInputSection.classList.remove("hidden");
        if (llmSuggestionSection) llmSuggestionSection.classList.add("hidden");
        
        // Tạo giao diện nhập liệu động
        this.createInputForms();
    },
    
    // Sử dụng LLM để gợi ý
    suggestFromLLM: async function() {
        const manualInputSection = document.getElementById("manualInputSection");
        const llmSuggestionSection = document.getElementById("llmSuggestionSection");
        
        if (manualInputSection) manualInputSection.classList.add("hidden");
        if (llmSuggestionSection) llmSuggestionSection.classList.remove("hidden");
        
        // Hiển thị trạng thái đang tải
        if (llmSuggestionSection) {
            llmSuggestionSection.innerHTML = `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Đang tạo gợi ý từ AI...</p>
                </div>
            `;
        }
        
        try {
            // Lấy mục tiêu từ input
            const goalInput = document.getElementById("goalInput");
            const goal = goalInput ? goalInput.value : "Chọn điện thoại phù hợp nhất";
            
            // Gọi API để lấy gợi ý
            const suggestions = await this.callLLMApi("getSuggestions", { goal });
            
            // Cập nhật dữ liệu
            if (suggestions && !suggestions.error) {
                this.data.selectedCriteria = suggestions.criteria || this.data.selectedCriteria;
                this.data.selectedAlternatives = suggestions.alternatives || this.data.selectedAlternatives;
                
                // Hiển thị kết quả
                this.updateDisplay();
                
                // Tiếp tục lấy ma trận so sánh
                await this.suggestComparisonMatrices(goal);
            } else {
                throw new Error(suggestions.error || "Không thể lấy gợi ý từ AI");
            }
        } catch (error) {
            console.error("Error with LLM suggestions:", error);
            if (llmSuggestionSection) {
                llmSuggestionSection.innerHTML = `
                    <div class="error-message">
                        <p>Đã xảy ra lỗi khi lấy gợi ý từ AI: ${error.message}</p>
                        <button id="retryLlmBtn" class="btn">Thử lại</button>
                        <button id="switchToManualBtn" class="btn">Chuyển sang nhập thủ công</button>
                    </div>
                `;
                
                document.getElementById("retryLlmBtn").addEventListener("click", () => this.suggestFromLLM());
                document.getElementById("switchToManualBtn").addEventListener("click", () => this.showManualInputForm());
            }
        }
    },
    
    // Lấy gợi ý cho ma trận so sánh từ LLM
    suggestComparisonMatrices: async function(goal) {
        const llmSuggestionSection = document.getElementById("llmSuggestionSection");
        
        if (llmSuggestionSection) {
            llmSuggestionSection.innerHTML += `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Đang tạo ma trận so sánh từ AI...</p>
                </div>
            `;
        }
        
        try {
            // Gọi API để lấy ma trận so sánh
            const matricesData = await this.callLLMApi("getAlternativeMatrices", {
                criteria: this.data.selectedCriteria,
                alternatives: this.data.selectedAlternatives,
                goal: goal
            });
            
            // Cập nhật dữ liệu
            if (matricesData && matricesData.matrices) {
                // Cập nhật ma trận tiêu chí (nếu có)
                if (matricesData.criteriaMatrix) {
                    this.data.criteriaMatrix = matricesData.criteriaMatrix;
                }
                
                // Cập nhật ma trận phương án
                this.data.alternativeMatrices = matricesData.matrices;
                
                // Hiển thị kết quả
                this.updateDisplay();
                this.calculate();
                
                // Hiển thị thông báo thành công
                if (llmSuggestionSection) {
                    llmSuggestionSection.innerHTML += `
                        <div class="success-message">
                            <p>Đã tạo ma trận so sánh thành công!</p>
                            <button id="editMatricesBtn" class="btn">Chỉnh sửa ma trận</button>
                        </div>
                    `;
                    
                    document.getElementById("editMatricesBtn").addEventListener("click", () => this.showMatrixEditForm());
                }
            } else {
                throw new Error(matricesData.error || "Không thể tạo ma trận so sánh");
            }
        } catch (error) {
            console.error("Error with LLM matrices:", error);
            if (llmSuggestionSection) {
                llmSuggestionSection.innerHTML += `
                    <div class="error-message">
                        <p>Đã xảy ra lỗi khi tạo ma trận so sánh: ${error.message}</p>
                        <button id="retryMatricesBtn" class="btn">Thử lại</button>
                        <button id="createManualMatricesBtn" class="btn">Tạo ma trận thủ công</button>
                    </div>
                `;
                
                document.getElementById("retryMatricesBtn").addEventListener("click", () => this.suggestComparisonMatrices(goal));
                document.getElementById("createManualMatricesBtn").addEventListener("click", () => this.showMatrixEditForm());
            }
        }
    },
    
    // Gọi API LLM
    callLLMApi: async function(endpoint, data) {
        // Định nghĩa các endpoint API
        const API_ENDPOINTS = {
            getSuggestions: '/get_suggestions',
            getAlternativeMatrices: '/get_alternative_matrices',
            calculateAHP: '/calculate_ahp',
            calculateAlternativeMatrices: '/calculate_alternative_matrices'
        };
        
        try {
            const response = await fetch(API_ENDPOINTS[endpoint], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error calling ${endpoint}:`, error);
            throw error;
        }
    },
};

// Cập nhật danh sách tiêu chí và phương án
document.getElementById("criteriaList").innerHTML = AHPCalculator.data.selectedCriteria.map(c => `<li>${c}</li>`).join("");
document.getElementById("alternativesList").innerHTML = AHPCalculator.data.selectedAlternatives.map(a => `<li>${a}</li>`).join("");

// Hiển thị ma trận so sánh cặp tiêu chí
function displayCriteriaMatrix() {
    const table = document.getElementById("criteriaMatrix");
    let html = "<tr><th></th>";
    
    // Header row
    AHPCalculator.data.selectedCriteria.forEach(c => {
        html += `<th>${c}</th>`;
    });
    html += "</tr>";
    
    // Data rows
    AHPCalculator.data.criteriaMatrix.forEach((row, i) => {
        html += `<tr><th>${AHPCalculator.data.selectedCriteria[i]}</th>`;
        row.forEach(val => {
            html += `<td>${typeof val === 'number' ? val.toFixed(2).replace('.00', '') : val}</td>`;
        });
        html += "</tr>";
    });
    
    table.innerHTML = html;
}

// Hiển thị ma trận so sánh cặp phương án theo từng tiêu chí
function displayAlternativeMatrices() {
    const container = document.getElementById("alternativeMatrices");
    container.innerHTML = "";
    
    AHPCalculator.data.selectedCriteria.forEach(criterion => {
        const matrix = AHPCalculator.data.alternativeMatrices[criterion];
        
        // Create section for this criterion
        const section = document.createElement("div");
        section.innerHTML = `<h3 class="section-title">Tiêu chí: ${criterion}</h3>`;
        
        // Create table
        const table = document.createElement("table");
        table.className = "matrix-table";
        
        let tableHtml = "<tr><th></th>";
        
        // Header row
        AHPCalculator.data.selectedAlternatives.forEach(alt => {
            tableHtml += `<th>${alt}</th>`;
        });
        tableHtml += "</tr>";
        
        // Data rows
        matrix.forEach((row, i) => {
            tableHtml += `<tr><th>${AHPCalculator.data.selectedAlternatives[i]}</th>`;
            row.forEach(val => {
                tableHtml += `<td>${typeof val === 'number' ? val.toFixed(2).replace('.00', '') : val}</td>`;
            });
            tableHtml += "</tr>";
        });
        
        table.innerHTML = tableHtml;
        section.appendChild(table);
        
        // Create element for weights display
        const weightsDiv = document.createElement("div");
        weightsDiv.id = `weights-${criterion}`;
        weightsDiv.className = "weights-display";
        section.appendChild(weightsDiv);
        
        // Create element for consistency check
        const consistencyDiv = document.createElement("div");
        consistencyDiv.id = `consistency-${criterion}`;
        consistencyDiv.className = "consistency-check";
        section.appendChild(consistencyDiv);
        
        // Add section to container
        container.appendChild(section);
    });
}

// Hàm tính toán AHP
function calculateAHP() {
    // 1. Tính trọng số tiêu chí
    const criteriaWeights = calculateWeights(AHPCalculator.data.criteriaMatrix);
    const criteriaConsistency = checkConsistency(AHPCalculator.data.criteriaMatrix, criteriaWeights);
    
    // Hiển thị trọng số tiêu chí
    const criteriaWeightsBody = document.getElementById("criteriaWeightsBody");
    criteriaWeightsBody.innerHTML = "";
    
    AHPCalculator.data.selectedCriteria.forEach((criterion, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${criterion}</td>
            <td>${criteriaWeights[i].toFixed(4)}</td>
        `;
        criteriaWeightsBody.appendChild(row);
    });
    
    // Hiển thị kiểm tra độ nhất quán cho tiêu chí
    const criteriaConsistencyDiv = document.getElementById("criteriaConsistency");
    criteriaConsistencyDiv.innerHTML = `
        <p>λ<sub>max</sub> = ${criteriaConsistency.lambdaMax.toFixed(4)}</p>
        <p>CI = ${criteriaConsistency.CI.toFixed(5)}</p>
        <p>CR = ${criteriaConsistency.CR.toFixed(6)} ${criteriaConsistency.isConsistent ? '✅ Hợp lệ (< 10%)' : '❌ Không hợp lệ (> 10%)'}</p>
    `;
    criteriaConsistencyDiv.className = criteriaConsistency.isConsistent ? 
        "consistency-check consistency-valid" : 
        "consistency-check consistency-invalid";
    
    // 2. Tính trọng số phương án theo từng tiêu chí
    const alternativeWeights = {};
    const alternativeConsistency = {};
    
    AHPCalculator.data.selectedCriteria.forEach(criterion => {
        const weights = calculateWeights(AHPCalculator.data.alternativeMatrices[criterion]);
        const consistency = checkConsistency(AHPCalculator.data.alternativeMatrices[criterion], weights);
        
        alternativeWeights[criterion] = weights;
        alternativeConsistency[criterion] = consistency;
        
        // Hiển thị trọng số phương án cho từng tiêu chí
        const weightsDiv = document.getElementById(`weights-${criterion}`);
        weightsDiv.innerHTML = "<h4>Trọng số:</h4>";
        
        const weightsTable = document.createElement("table");
        weightsTable.className = "weights-table";
        
        let weightsHtml = `
            <tr>
                ${AHPCalculator.data.selectedAlternatives.map((alt, i) => `
                    <th>${alt}</th>
                `).join('')}
            </tr>
            <tr>
                ${weights.map(w => `
                    <td>${w.toFixed(4)}</td>
                `).join('')}
            </tr>
        `;
        
        weightsTable.innerHTML = weightsHtml;
        weightsDiv.appendChild(weightsTable);
        
        // Hiển thị kết quả kiểm tra độ nhất quán
        const consistencyDiv = document.getElementById(`consistency-${criterion}`);
        consistencyDiv.innerHTML = `
            <p>CR = ${consistency.CR.toFixed(6)} ${consistency.isConsistent ? '✅ Hợp lệ (< 10%)' : '❌ Không hợp lệ (> 10%)'}</p>
        `;
        consistencyDiv.className = consistency.isConsistent ? 
            "consistency-check consistency-valid" : 
            "consistency-check consistency-invalid";
    });
    
    // Hiển thị bảng tổng hợp trọng số phương án theo tiêu chí
    const alternativeWeightsHead = document.getElementById("alternativeWeightsHead");
    const alternativeWeightsBody = document.getElementById("alternativeWeightsBody");
    
    // Header row
    let headHtml = "<tr><th>Tiêu chí</th>";
    AHPCalculator.data.selectedAlternatives.forEach(alt => {
        headHtml += `<th>${alt}</th>`;
    });
    headHtml += "</tr>";
    alternativeWeightsHead.innerHTML = headHtml;
    
    // Body rows
    alternativeWeightsBody.innerHTML = "";
    AHPCalculator.data.selectedCriteria.forEach(criterion => {
        const row = document.createElement("tr");
        let rowHtml = `<td>${criterion}</td>`;
        
        AHPCalculator.data.selectedAlternatives.forEach((alt, i) => {
            rowHtml += `<td>${alternativeWeights[criterion][i].toFixed(4)}</td>`;
        });
        
        row.innerHTML = rowHtml;
        alternativeWeightsBody.appendChild(row);
    });
    
    // 3. Tính điểm số cuối cùng
    const finalScores = {};
    
    AHPCalculator.data.selectedAlternatives.forEach((alt, i) => {
        let score = 0;
        AHPCalculator.data.selectedCriteria.forEach((criterion, j) => {
            score += criteriaWeights[j] * alternativeWeights[criterion][i];
        });
        finalScores[alt] = score;
    });
    
    // 4. Hiển thị kết quả cuối cùng
    displayFinalResults(finalScores);
}

// Hàm tính trọng số từ ma trận so sánh cặp
function calculateWeights(matrix) {
    const n = matrix.length;
    
    // Tính tổng của mỗi cột
    const columnSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            columnSums[j] += matrix[i][j];
        }
    }
    
    // Chuẩn hóa ma trận
    const normalizedMatrix = [];
    for (let i = 0; i < n; i++) {
        normalizedMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
        }
    }
    
    // Tính trọng số (trung bình các hàng trong ma trận đã chuẩn hóa)
    const weights = [];
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += normalizedMatrix[i][j];
        }
        weights[i] = sum / n;
    }
    
    return weights;
}

// Hàm kiểm tra độ nhất quán (Consistency Ratio - CR)
function checkConsistency(matrix, weights) {
    const n = matrix.length;
    
    // Tính weighted sum
    const weightedSums = [];
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += matrix[i][j] * weights[j];
        }
        weightedSums[i] = sum;
    }
    
    // Tính lambda max
    const lambdaValues = [];
    for (let i = 0; i < n; i++) {
        lambdaValues[i] = weightedSums[i] / weights[i];
    }
    
    const lambdaMax = lambdaValues.reduce((sum, val) => sum + val, 0) / n;
    
    // Tính Consistency Index (CI)
    const CI = (lambdaMax - n) / (n - 1);
    
    // Random Index (RI) values based on matrix size
    const RI_VALUES = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    const RI = RI_VALUES[n - 1] || 1.49;
    
    // Tính Consistency Ratio (CR)
    const CR = CI / RI;
    
    return {
        lambdaMax,
        CI,
        RI,
        CR,
        isConsistent: CR < 0.1
    };
}

// Hiển thị kết quả cuối cùng
function displayFinalResults(finalScores) {
    // Sắp xếp phương án theo điểm số giảm dần
    const sortedAlternatives = Object.keys(finalScores).sort((a, b) => finalScores[b] - finalScores[a]);
    
    // Cập nhật bảng kết quả
    const tableBody = document.getElementById("finalResultsBody");
    tableBody.innerHTML = "";
    
    sortedAlternatives.forEach((alt, index) => {
        const row = document.createElement("tr");
        if (index === 0) row.classList.add("best-alternative");
        
        row.innerHTML = `
            <td>${alt}</td>
            <td>${finalScores[alt].toFixed(4)}</td>
            <td>${index + 1}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Vẽ biểu đồ kết quả
    const ctx = document.getElementById("finalScoresChart").getContext("2d");
    
    if (window.finalChart) {
        window.finalChart.destroy();
    }
    
    window.finalChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: sortedAlternatives,
            datasets: [{
                label: "Điểm số",
                data: sortedAlternatives.map(alt => finalScores[alt]),
                backgroundColor: [
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)"
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...Object.values(finalScores)) * 1.1
                }
            }
        }
    });
}

// Khởi tạo hiển thị
displayCriteriaMatrix();
displayAlternativeMatrices();

// Bắt sự kiện nút tính toán
document.getElementById("calculateButton").addEventListener("click", calculateAHP);

// Tự động tính toán khi tải trang
document.addEventListener("DOMContentLoaded", calculateAHP);
