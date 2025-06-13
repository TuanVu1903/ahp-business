// Các hàm có trong file js
// biến selectedCriteria, selectedAlternatives lấy từ gợi ý từ LLM
// biến criteriaMatrix, alternativeMatrices lấy từ người dùng nhập vào
// hàm displayCriteriaMatrix, displayAlternativeMatrices hiển thị ma trận so sánh cặp tiêu chí và phương án
// hàm calculateAHP tính toán AHP
// hàm calculateWeights tính trọng số từ ma trận so sánh cặp
// hàm checkConsistency kiểm tra độ nhất quán (Consistency Ratio - CR)
// hàm displayFinalResults hiển thị kết quả cuối cùng

class AHPCalculator {
    constructor() {
        this.selectedCriteria = [];
        this.selectedAlternatives = [];
        this.criteriaMatrix = [];
        this.alternativeMatrices = {};
        this.currentStep = 1;
    }

    // Step 1: LLM Integration
    async getLLMSuggestions() {
        const goal = document.getElementById('goalInput').value;
        const file = document.getElementById('fileInput').files[0];

        try {
            // Gọi API đến LLM
            const formData = new FormData();
            formData.append('goal', goal);
            if (file) formData.append('file', file);

            const response = await fetch('/api/get-suggestions', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            this.selectedCriteria = data.criteria;
            this.selectedAlternatives = data.alternatives;

            // Chuyển sang bước 2
            this.showCriteriaMatrixInput();
        } catch (error) {
            console.error('Error getting LLM suggestions:', error);
            alert('Có lỗi xảy ra khi lấy gợi ý từ LLM');
        }
    }

    // Step 2: Criteria Matrix Input
    showCriteriaMatrixInput() {
        const container = document.getElementById('criteriaMatrixContainer');
        container.innerHTML = this.createMatrixInputHTML(
            this.selectedCriteria,
            this.selectedCriteria,
            'criteria'
        );

        this.switchToStep(2);
    }

    saveCriteriaMatrix() {
        this.criteriaMatrix = this.getMatrixFromInputs('criteria');
        if (this.validateMatrix(this.criteriaMatrix)) {
            this.showAlternativeMatricesInput();
        } else {
            alert('Ma trận không hợp lệ. Vui lòng kiểm tra lại.');
        }
    }

    // Step 3: Alternative Matrices Input
    showAlternativeMatricesInput() {
        const container = document.getElementById('alternativeMatricesContainer');
        container.innerHTML = '';

        this.selectedCriteria.forEach(criterion => {
            const matrixDiv = document.createElement('div');
            matrixDiv.innerHTML = `
                <h3>Tiêu chí: ${criterion}</h3>
                ${this.createMatrixInputHTML(
                    this.selectedAlternatives,
                    this.selectedAlternatives,
                    `alternative-${criterion}`
                )}
            `;
            container.appendChild(matrixDiv);
        });

        this.switchToStep(3);
    }

    // Step 4: Calculate Final Results
    calculateFinalResults() {
        // Lấy ma trận phương án cho từng tiêu chí
        this.alternativeMatrices = {};
        this.selectedCriteria.forEach(criterion => {
            this.alternativeMatrices[criterion] = this.getMatrixFromInputs(`alternative-${criterion}`);
        });

        // Kiểm tra tính hợp lệ của tất cả ma trận
        let allValid = true;
        for (let matrix of Object.values(this.alternativeMatrices)) {
            if (!this.validateMatrix(matrix)) {
                allValid = false;
                break;
            }
        }

        if (!allValid) {
            alert('Một hoặc nhiều ma trận không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        // Tính toán kết quả
        const criteriaWeights = this.calculateWeights(this.criteriaMatrix);
        const alternativeWeights = {};
        const finalScores = {};

        // Tính trọng số cho từng phương án theo từng tiêu chí
        this.selectedCriteria.forEach(criterion => {
            alternativeWeights[criterion] = this.calculateWeights(this.alternativeMatrices[criterion]);
        });

        // Tính điểm số cuối cùng
        this.selectedAlternatives.forEach((alt, i) => {
        let score = 0;
            this.selectedCriteria.forEach((criterion, j) => {
            score += criteriaWeights[j] * alternativeWeights[criterion][i];
        });
        finalScores[alt] = score;
    });
    
        this.displayResults(finalScores, criteriaWeights, alternativeWeights);
        this.switchToStep(4);
    }

    // Utility Methods
    createMatrixInputHTML(rowLabels, colLabels, matrixId) {
        let html = '<table>';
        
        // Header row
        html += '<tr><th></th>';
        colLabels.forEach(label => {
            html += `<th>${label}</th>`;
        });
        html += '</tr>';

        // Matrix rows
        rowLabels.forEach((rowLabel, i) => {
            html += `<tr><th>${rowLabel}</th>`;
            colLabels.forEach((_, j) => {
                if (i === j) {
                    html += '<td><input type="number" value="1" readonly></td>';
                } else {
                    html += `<td><input type="number" 
                        id="${matrixId}-${i}-${j}" 
                        onchange="ahpCalculator.updateReciprocalValue('${matrixId}',${i},${j})"></td>`;
                }
            });
            html += '</tr>';
        });

        html += '</table>';
        return html;
    }

    updateReciprocalValue(matrixId, i, j) {
        const input = document.getElementById(`${matrixId}-${i}-${j}`);
        const reciprocalInput = document.getElementById(`${matrixId}-${j}-${i}`);
        
        if (input.value && input.value > 0) {
            reciprocalInput.value = (1 / input.value).toFixed(4);
        }
    }

    getMatrixFromInputs(matrixId) {
        const size = matrixId.startsWith('criteria') ? 
            this.selectedCriteria.length : 
            this.selectedAlternatives.length;
        
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i === j) {
                    matrix[i][j] = 1;
                } else {
                    const input = document.getElementById(`${matrixId}-${i}-${j}`);
                    matrix[i][j] = parseFloat(input.value);
                }
            }
        }
        
        return matrix;
    }

    validateMatrix(matrix) {
        // Kiểm tra tính hợp lệ của ma trận
        return true; // Implement validation logic here
    }

    calculateWeights(matrix) {
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
    
        // Tính trọng số
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

    displayResults(finalScores, criteriaWeights, alternativeWeights) {
        const resultsDiv = document.getElementById('finalResults');
        const sortedAlternatives = Object.entries(finalScores)
            .sort(([,a], [,b]) => b - a)
            .map(([alt]) => alt);

        let html = `
            <h3>Trọng số các Tiêu chí</h3>
            <table>
                <tr><th>Tiêu chí</th><th>Trọng số</th></tr>
                ${this.selectedCriteria.map((criterion, i) => `
                    <tr><td>${criterion}</td><td>${criteriaWeights[i].toFixed(4)}</td></tr>
                `).join('')}
            </table>

            <h3>Kết quả Cuối cùng</h3>
            <table>
                <tr><th>Phương án</th><th>Điểm số</th><th>Xếp hạng</th></tr>
                ${sortedAlternatives.map((alt, index) => `
                    <tr>
            <td>${alt}</td>
            <td>${finalScores[alt].toFixed(4)}</td>
            <td>${index + 1}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        resultsDiv.innerHTML = html;
        this.drawChart(sortedAlternatives, finalScores);
    }

    drawChart(alternatives, scores) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
        data: {
                labels: alternatives,
            datasets: [{
                    label: 'Điểm số',
                    data: alternatives.map(alt => scores[alt]),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                        beginAtZero: true
                }
            }
        }
    });
}

    switchToStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step${stepNumber}`).classList.add('active');
        this.currentStep = stepNumber;
    }
}

// Initialize the calculator
const ahpCalculator = new AHPCalculator();

// Global function bindings
window.getLLMSuggestions = () => ahpCalculator.getLLMSuggestions();
window.saveCriteriaMatrix = () => ahpCalculator.saveCriteriaMatrix();
window.calculateFinalResults = () => ahpCalculator.calculateFinalResults();
