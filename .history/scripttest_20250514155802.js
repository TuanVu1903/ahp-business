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
    
    // Thêm một tiêu chí mới
    addCriterion: function() {
        const criterionInput = document.getElementById("criterionInput");
        
        if (criterionInput && criterionInput.value.trim()) {
            const newCriterion = criterionInput.value.trim();
            
            // Kiểm tra trùng lặp
            if (!this.data.selectedCriteria.includes(newCriterion)) {
                this.data.selectedCriteria.push(newCriterion);
                criterionInput.value = "";
                
                // Cập nhật ma trận tiêu chí
                this.updateCriteriaMatrix();
                
                // Cập nhật hiển thị
                this.updateDisplay();
            } else {
                alert("Tiêu chí này đã tồn tại!");
            }
        }
    },
    
    // Thêm một phương án mới
    addAlternative: function() {
        const alternativeInput = document.getElementById("alternativeInput");
        
        if (alternativeInput && alternativeInput.value.trim()) {
            const newAlternative = alternativeInput.value.trim();
            
            // Kiểm tra trùng lặp
            if (!this.data.selectedAlternatives.includes(newAlternative)) {
                this.data.selectedAlternatives.push(newAlternative);
                alternativeInput.value = "";
                
                // Cập nhật ma trận phương án
                this.updateAlternativeMatrices();
                
                // Cập nhật hiển thị
                this.updateDisplay();
            } else {
                alert("Phương án này đã tồn tại!");
            }
        }
    },
    
    // Cập nhật ma trận tiêu chí khi thêm/xóa tiêu chí
    updateCriteriaMatrix: function() {
        const n = this.data.selectedCriteria.length;
        const oldMatrix = this.data.criteriaMatrix;
        const oldN = oldMatrix.length;
        
        // Tạo ma trận mới với kích thước phù hợp
        const newMatrix = Array(n).fill().map(() => Array(n).fill(1));
        
        // Sao chép giá trị từ ma trận cũ (nếu có)
        for (let i = 0; i < Math.min(n, oldN); i++) {
            for (let j = 0; j < Math.min(n, oldN); j++) {
                newMatrix[i][j] = oldMatrix[i][j];
            }
        }
        
        this.data.criteriaMatrix = newMatrix;
    },
    
    // Cập nhật ma trận phương án khi thêm/xóa phương án hoặc tiêu chí
    updateAlternativeMatrices: function() {
        const n = this.data.selectedAlternatives.length;
        const oldMatrices = this.data.alternativeMatrices;
        const newMatrices = {};
        
        // Xử lý từng tiêu chí
        this.data.selectedCriteria.forEach(criterion => {
            const oldMatrix = oldMatrices[criterion] || Array(Math.min(n, 3)).fill().map(() => Array(Math.min(n, 3)).fill(1));
            const oldN = oldMatrix.length;
            
            // Tạo ma trận mới với kích thước phù hợp
            const newMatrix = Array(n).fill().map(() => Array(n).fill(1));
            
            // Sao chép giá trị từ ma trận cũ (nếu có)
            for (let i = 0; i < Math.min(n, oldN); i++) {
                for (let j = 0; j < Math.min(n, oldN); j++) {
                    newMatrix[i][j] = oldMatrix[i][j];
                }
            }
            
            newMatrices[criterion] = newMatrix;
        });
        
        this.data.alternativeMatrices = newMatrices;
    },
    
    // Cập nhật hiển thị
    updateDisplay: function() {
        // Cập nhật danh sách tiêu chí và phương án
        const criteriaList = document.getElementById("criteriaList");
        const alternativesList = document.getElementById("alternativesList");
        
        if (criteriaList) {
            criteriaList.innerHTML = this.data.selectedCriteria.map(c => 
                `<li>${c} <button class="delete-btn" data-type="criterion" data-value="${c}">×</button></li>`
            ).join("");
            
            // Thêm sự kiện xóa
            criteriaList.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const criterion = e.target.getAttribute("data-value");
                    this.removeCriterion(criterion);
                });
            });
        }
        
        if (alternativesList) {
            alternativesList.innerHTML = this.data.selectedAlternatives.map(a => 
                `<li>${a} <button class="delete-btn" data-type="alternative" data-value="${a}">×</button></li>`
            ).join("");
            
            // Thêm sự kiện xóa
            alternativesList.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const alternative = e.target.getAttribute("data-value");
                    this.removeAlternative(alternative);
                });
            });
        }
        
        // Hiển thị ma trận tiêu chí
        this.displayCriteriaMatrix();
        
        // Hiển thị ma trận phương án
        this.displayAlternativeMatrices();
    },
    
    // Xóa một tiêu chí
    removeCriterion: function(criterion) {
        const index = this.data.selectedCriteria.indexOf(criterion);
        
        if (index !== -1) {
            // Xóa khỏi danh sách
            this.data.selectedCriteria.splice(index, 1);
            
            // Xóa khỏi ma trận tiêu chí
            this.data.criteriaMatrix.splice(index, 1);
            this.data.criteriaMatrix.forEach(row => row.splice(index, 1));
            
            // Xóa ma trận phương án tương ứng
            delete this.data.alternativeMatrices[criterion];
            
            // Cập nhật hiển thị
            this.updateDisplay();
        }
    },
    
    // Xóa một phương án
    removeAlternative: function(alternative) {
        const index = this.data.selectedAlternatives.indexOf(alternative);
        
        if (index !== -1) {
            // Xóa khỏi danh sách
            this.data.selectedAlternatives.splice(index, 1);
            
            // Cập nhật tất cả ma trận phương án
            Object.keys(this.data.alternativeMatrices).forEach(criterion => {
                // Xóa hàng và cột tương ứng
                this.data.alternativeMatrices[criterion].splice(index, 1);
                this.data.alternativeMatrices[criterion].forEach(row => row.splice(index, 1));
            });
            
            // Cập nhật hiển thị
            this.updateDisplay();
        }
    },
    
    // Hiển thị form chỉnh sửa ma trận
    showMatrixEditForm: function() {
        const matrixEditForm = document.getElementById("matrixEditForm");
        
        if (matrixEditForm) {
            matrixEditForm.classList.remove("hidden");
            
            // Tạo giao diện chỉnh sửa ma trận
            this.createMatrixEditForm();
        }
    },
    
    // Tạo form chỉnh sửa ma trận
    createMatrixEditForm: function() {
        const matrixEditForm = document.getElementById("matrixEditForm");
        
        if (matrixEditForm) {
            matrixEditForm.innerHTML = `
                <h3>Chỉnh sửa Ma trận So sánh cặp Tiêu chí</h3>
                <div id="criteriaMatrixEdit"></div>
                
                <h3>Chỉnh sửa Ma trận So sánh cặp Phương án theo từng Tiêu chí</h3>
                <div id="alternativeMatricesEdit"></div>
                
                <button id="saveMatricesBtn" class="btn">Lưu thay đổi</button>
                <button id="cancelMatricesBtn" class="btn">Hủy</button>
            `;
            
            // Tạo form chỉnh sửa ma trận tiêu chí
            this.createCriteriaMatrixEditForm();
            
            // Tạo form chỉnh sửa ma trận phương án
            this.createAlternativeMatricesEditForm();
            
            // Thêm sự kiện cho các nút
            document.getElementById("saveMatricesBtn").addEventListener("click", () => this.saveMatricesChanges());
            document.getElementById("cancelMatricesBtn").addEventListener("click", () => {
                matrixEditForm.classList.add("hidden");
            });
        }
    },
    
    // Tạo form chỉnh sửa ma trận tiêu chí
    createCriteriaMatrixEditForm: function() {
        const container = document.getElementById("criteriaMatrixEdit");
        
        if (container) {
            const n = this.data.selectedCriteria.length;
            let html = `<table class="matrix-table editable-matrix">`;
            
            // Header row
            html += `<tr><th></th>`;
            this.data.selectedCriteria.forEach(c => {
                html += `<th>${c}</th>`;
            });
            html += `</tr>`;
            
            // Data rows
            for (let i = 0; i < n; i++) {
                html += `<tr><th>${this.data.selectedCriteria[i]}</th>`;
                
                for (let j = 0; j < n; j++) {
                    if (i === j) {
                        // Đường chéo luôn là 1
                        html += `<td>1</td>`;
                    } else if (i < j) {
                        // Nhập giá trị cho nửa trên tam giác
                        html += `
                            <td>
                                <input type="number" 
                                    class="matrix-input" 
                                    data-type="criteria" 
                                    data-row="${i}" 
                                    data-col="${j}" 
                                    min="0.11" 
                                    max="9" 
                                    step="0.1" 
                                    value="${this.data.criteriaMatrix[i][j]}"
                                >
                            </td>
                        `;
                    } else {
                        // Nửa dưới tam giác (giá trị nghịch đảo)
                        html += `<td class="reciprocal" id="criteria-reciprocal-${i}-${j}">${this.formatValue(this.data.criteriaMatrix[i][j])}</td>`;
                    }
                }
                
                html += `</tr>`;
            }
            
            html += `</table>`;
            container.innerHTML = html;
            
            // Thêm sự kiện cập nhật giá trị nghịch đảo
            container.querySelectorAll(".matrix-input").forEach(input => {
                input.addEventListener("change", (e) => this.updateReciprocalValue(e.target));
            });
        }
    },
    
    // Tạo form chỉnh sửa ma trận phương án
    createAlternativeMatricesEditForm: function() {
        const container = document.getElementById("alternativeMatricesEdit");
        
        if (container) {
            container.innerHTML = "";
            
            // Tạo tab cho từng tiêu chí
            const tabContainer = document.createElement("div");
            tabContainer.className = "tab-container";
            
            const tabContent = document.createElement("div");
            tabContent.className = "tab-content";
            
            // Tạo tabs
            let tabHtml = "";
            this.data.selectedCriteria.forEach((criterion, index) => {
                tabHtml += `<button class="tab-btn ${index === 0 ? 'active' : ''}" data-tab="${criterion}">${criterion}</button>`;
            });
            tabContainer.innerHTML = tabHtml;
            
            // Tạo nội dung tab
            this.data.selectedCriteria.forEach((criterion, index) => {
                const tabPane = document.createElement("div");
                tabPane.className = `tab-pane ${index === 0 ? 'active' : ''}`;
                tabPane.id = `tab-${criterion}`;
                
                // Tạo bảng ma trận cho tiêu chí này
                const n = this.data.selectedAlternatives.length;
                let tableHtml = `<table class="matrix-table editable-matrix">`;
                
                // Header row
                tableHtml += `<tr><th></th>`;
                this.data.selectedAlternatives.forEach(alt => {
                    tableHtml += `<th>${alt}</th>`;
                });
                tableHtml += `</tr>`;
                
                // Data rows
                for (let i = 0; i < n; i++) {
                    tableHtml += `<tr><th>${this.data.selectedAlternatives[i]}</th>`;
                    
                    for (let j = 0; j < n; j++) {
                        if (i === j) {
                            // Đường chéo luôn là 1
                            tableHtml += `<td>1</td>`;
                        } else if (i < j) {
                            // Nhập giá trị cho nửa trên tam giác
                            tableHtml += `
                                <td>
                                    <input type="number" 
                                        class="matrix-input" 
                                        data-type="alternative" 
                                        data-criterion="${criterion}"
                                        data-row="${i}" 
                                        data-col="${j}" 
                                        min="0.11" 
                                        max="9" 
                                        step="0.1" 
                                        value="${this.data.alternativeMatrices[criterion][i][j]}"
                                    >
                                </td>
                            `;
                        } else {
                            // Nửa dưới tam giác (giá trị nghịch đảo)
                            tableHtml += `<td class="reciprocal" id="alternative-${criterion}-reciprocal-${i}-${j}">${this.formatValue(this.data.alternativeMatrices[criterion][i][j])}</td>`;
                        }
                    }
                    
                    tableHtml += `</tr>`;
                }
                
                tableHtml += `</table>`;
                tabPane.innerHTML = tableHtml;
                tabContent.appendChild(tabPane);
            });
            
            container.appendChild(tabContainer);
            container.appendChild(tabContent);
            
            // Thêm sự kiện cho tabs
            tabContainer.querySelectorAll(".tab-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const tab = e.target.getAttribute("data-tab");
                    
                    // Xóa active cho tất cả tab và tab-pane
                    tabContainer.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                    tabContent.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
                    
                    // Thêm active cho tab được chọn
                    e.target.classList.add("active");
                    document.getElementById(`tab-${tab}`).classList.add("active");
                });
            });
            
            // Thêm sự kiện cập nhật giá trị nghịch đảo
            tabContent.querySelectorAll(".matrix-input").forEach(input => {
                input.addEventListener("change", (e) => this.updateReciprocalValue(e.target));
            });
        },
    },
    
    // Cập nhật giá trị nghịch đảo khi thay đổi giá trị trong ma trận
    updateReciprocalValue: function(input) {
        const type = input.getAttribute("data-type");
        const row = parseInt(input.getAttribute("data-row"));
        const col = parseInt(input.getAttribute("data-col"));
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value <= 0) {
            alert("Giá trị phải lớn hơn 0!");
            input.value = 1;
            return;
        }
        
        // Tính giá trị nghịch đảo
        const reciprocal = 1 / value;
        
        if (type === "criteria") {
            // Cập nhật giá trị trong ma trận
            this.data.criteriaMatrix[row][col] = value;
            this.data.criteriaMatrix[col][row] = reciprocal;
            
            // Cập nhật hiển thị
            const reciprocalElement = document.getElementById(`criteria-reciprocal-${col}-${row}`);
            if (reciprocalElement) {
                reciprocalElement.textContent = this.formatValue(reciprocal);
            }
        } else if (type === "alternative") {
            const criterion = input.getAttribute("data-criterion");
            
            // Cập nhật giá trị trong ma trận
            this.data.alternativeMatrices[criterion][row][col] = value;
            this.data.alternativeMatrices[criterion][col][row] = reciprocal;
            
            // Cập nhật hiển thị
            const reciprocalElement = document.getElementById(`alternative-${criterion}-reciprocal-${col}-${row}`);
            if (reciprocalElement) {
                reciprocalElement.textContent = this.formatValue(reciprocal);
            }
        }
    },
    
    // Lưu các thay đổi trong ma trận
    saveMatricesChanges: function() {
        // Lưu thay đổi cho ma trận tiêu chí
        document.querySelectorAll("#criteriaMatrixEdit .matrix-input").forEach(input => {
            const row = parseInt(input.getAttribute("data-row"));
            const col = parseInt(input.getAttribute("data-col"));
            const value = parseFloat(input.value);
            
            if (!isNaN(value) && value > 0) {
                this.data.criteriaMatrix[row][col] = value;
                this.data.criteriaMatrix[col][row] = 1 / value;
            }
        });
        
        // Lưu thay đổi cho ma trận phương án
        document.querySelectorAll("#alternativeMatricesEdit .matrix-input").forEach(input => {
            const criterion = input.getAttribute("data-criterion");
            const row = parseInt(input.getAttribute("data-row"));
            const col = parseInt(input.getAttribute("data-col"));
            const value = parseFloat(input.value);
            
            if (!isNaN(value) && value > 0) {
                this.data.alternativeMatrices[criterion][row][col] = value;
                this.data.alternativeMatrices[criterion][col][row] = 1 / value;
            }
        });
        
        // Ẩn form chỉnh sửa
        const matrixEditForm = document.getElementById("matrixEditForm");
        if (matrixEditForm) {
            matrixEditForm.classList.add("hidden");
        }
        
        // Cập nhật hiển thị
        this.updateDisplay();
        
        // Tính toán lại
        this.calculate();
    },
    
    // Định dạng giá trị để hiển thị
    formatValue: function(value) {
        if (value === 1) {
            return "1";
        } else if (value < 1) {
            // Nếu là phân số 1/x
            const denominator = Math.round(1 / value);
            return `1/${denominator}`;
        } else {
            // Làm tròn
            return Math.round(value * 100) / 100;
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
