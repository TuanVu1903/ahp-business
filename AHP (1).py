import numpy as np
def calculate_CR(matrix):
    matrix_original = matrix.copy()
    n = matrix.shape[0]

    #Tính sum từng cột
    arr_sum = [] 
    for i in range(0, n, 1): 
        sum = 0;
        for j in range(0, n, 1): 
            sum += matrix[j][i]
        arr_sum.append(sum)

    #Chuẩn hóa ma trận so sánh cặp bằng cách lấy giá trị cảu mỗi ô chia cho tổng theo cột 
    for i in range(0, n, 1): 
        for j in range(0, n, 1): 
            matrix[j][i] = matrix[j][i] / arr_sum[i]

    #Tính Criteria Weight
    arr_avg = [] 
    for i in range(0, n, 1): 
        sum = 0;
        for j in range(0, n, 1): 
            sum += matrix[i][j]
        arr_avg.append(sum/n)

    #Nhân Criteria Weight với ma trận so sánh cặp
    for i in range(0, n, 1): 
        for j in range(0, n, 1): 
            matrix_original[j][i] = matrix_original[j][i] * arr_avg[i]
    
    #Tính Weighted Sum Value
    arr_WSV = [] 
    for i in range(0, n, 1): 
        sum = 0;
        for j in range(0, n, 1): 
            sum += matrix_original[i][j]
        arr_WSV.append(sum)
    
    #Tính Consistery Vector
    arr_CV = []
    for i in range(0, len(arr_WSV), 1): 
        arr_CV.append(arr_WSV[i] / arr_avg[i])

    #Tính Lamda Max
    sum = 0
    for value in arr_CV:
        sum += value
    lamda_max = sum / len(arr_CV)

    #Tính CI
    CI = (lamda_max - n) / (n - 1)

    RI_cs = [0.00, 0.00, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.54, 1.56, 1.58, 1.59]

    CR = CI / RI_cs[n-1]

    return CR

matrix = np.array([
    [1, 1/2, 3, 1/2, 1/3, 1/3, 1/4],
    [2, 1, 4, 2, 1, 1/2, 1/3],
    [1/3, 1/4, 1, 1/3, 1/3, 1/5, 1/6],
    [2, 1/2, 3, 1, 2, 1, 1/2],
    [3, 1, 3, 1/2, 1, 2,1],
    [3, 2, 5, 1, 1/2, 1, 2],
    [4, 3, 6, 2, 1, 1/2, 1]
])

print(calculate_CR(matrix))
