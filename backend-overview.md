# MoneyWise - Backend System Overview (V2 - Chuẩn Thực Tế)

Dựa trên cấu trúc frontend và file `fakeData.ts`, dưới đây là tổng quan về thiết kế hệ thống Backend. Phiên bản này đã được nâng cấp với các "Best Practices" để đảm bảo hệ thống có thể hoạt động trơn tru, toàn vẹn dữ liệu (Data Integrity) và đúng chuẩn ứng dụng tài chính thực tế.

## 1. Data Models (Thiết kế Database)

Hệ thống cần các thực thể (entities) cơ bản sau:

### 1.1. User (Người dùng)
- `id`: UUID / CUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `passwordHash`: String
- `currency`: String (Default: `'VND'`) - *Hỗ trợ mở rộng đa tiền tệ*
- `createdAt`, `updatedAt`: DateTime

### 1.2. Category (Danh mục thu chi)
- `id`: UUID / CUID
- `userId`: UUID (Reference to User)
- `name`: String
- `type`: Enum (`'income'`, `'expense'`, `'both'`)
- `icon`: String (Emoji hoặc Icon identifier)
- `color`: String (Mã Hex color)
- `description`: String (Optional)
- `isSystem`: Boolean (Đánh dấu danh mục mặc định của hệ thống)
- `deletedAt`: DateTime (Nullable) - *Sử dụng Soft Delete*

### 1.3. Transaction (Giao dịch)
- `id`: UUID / CUID
- `userId`: UUID (Index)
- `categoryId`: UUID (Reference to Category, **ON DELETE RESTRICT**)
- `linkedGoalId`: UUID (Nullable) - *Reference tới Savings Goal nếu là giao dịch trích tiền vào quỹ*
- `title`: String
- `amount`: Decimal(15, 2) hoặc Integer (*Lưu số nguyên để tránh lỗi làm tròn dấu phẩy động*)
- `type`: Enum (`'income'`, `'expense'`, `'transfer'`)
- `date`: DateTime (Ngày giao dịch - Cần đánh Index)
- `paymentMethod`: Enum (`'Cash'`, `'Bank Transfer'`, `'Credit Card'`, `'E-Wallet'`)
- `note`: Text (Optional)
- `createdAt`, `updatedAt`: DateTime
- `deletedAt`: DateTime (Nullable) - *Sử dụng Soft Delete*

### 1.4. Budget (Ngân sách)
- `id`: UUID / CUID
- `userId`: UUID
- `categoryId`: UUID (Reference to Category)
- `limit`: Decimal(15, 2) (Giới hạn ngân sách)
- *(Không lưu field `spent` ở DB, số tiền chi tiêu thật sẽ được tính toán động (SUM) từ bảng Transaction dựa vào categoryId và thời gian hiện tại để đảm bảo chính xác tuyệt đối)*

### 1.5. Savings Goal (Mục tiêu tiết kiệm)
- `id`: UUID / CUID
- `userId`: UUID
- `name`: String
- `target`: Decimal(15, 2) (Số tiền mục tiêu)
- `targetDate`: DateTime (Ngày dự kiến hoàn thành)
- `icon`: String
- `color`: String
- `createdAt`, `updatedAt`: DateTime
- *(Field `saved` tính bằng tổng amount của các Transaction có `linkedGoalId` trùng với id này)*

---

## 2. API Endpoints (RESTful API)

Mọi endpoint (trừ Auth) đều cần Authorizer Middleware check `Bearer <JWT_TOKEN>`.

### 2.1. Authentication (Xác thực)
| Method | Endpoint | Action | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Đăng ký | Tạo tài khoản người dùng mới |
| POST | `/api/auth/login` | Đăng nhập | Trả về JWT Token và thông tin User |
| GET | `/api/auth/me` | Lấy Profile | Lấy thông tin user hiện tại |

### 2.2. Categories (Quản lý Danh mục)
| Method | Endpoint | Action | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/categories` | Lấy danh sách | Kèm filter `type` (ẩn category bị `deletedAt != null`) |
| POST | `/api/categories` | Tạo mới | Thêm mới 1 Custom Category (`isSystem = false`) |
| PUT | `/api/categories/:id` | Cập nhật | Server chặn không cho sửa nếu `isSystem = true` |
| DELETE | `/api/categories/:id` | Xóa mềm | Cập nhật `deletedAt`. Database chặn xóa cứng báo lỗi nếu có Transaction ràng buộc. |

### 2.3. Transactions (Giao dịch)
| Method | Endpoint | Action | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/transactions` | Lấy danh sách | **Bắt buộc có Pagination** (`page`, `limit`). Kèm filter: startDate, endDate, categoryId. |
| GET | `/api/transactions/:id` | Xem chi tiết | Trả về thông tin đầy đủ của 1 GD |
| POST | `/api/transactions` | Tạo mới | Valid input chặt chẽ (amount > 0, etc.) |
| PUT | `/api/transactions/:id` | Cập nhật | Sửa giao dịch đã có |
| DELETE | `/api/transactions/:id` | Xóa mềm | Cập nhật `deletedAt` |

### 2.4. Budgets (Ngân sách) & Savings Goals
| Method | Endpoint | Action | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/budgets` | DS ngân sách | Backend sẽ tự động JOIN bảng Transaction để tiêm biến `spent` vào kết quả trả về. |
| POST | `/api/budgets` | Tạo budget | |
| GET | `/api/goals` | DS mục tiêu | Join bảng Transaction để tính toán số tiền `saved`. |
| POST | `/api/goals/:id/add-funds`| Thêm tiền quỹ| Logic: Tạo ra 1 `Transaction (type='transfer', amount=-X, linkedGoalId=ID)` để lưu log lịch sử tiền. |

### 2.5. Analytics (Thống kê / Báo cáo) - *Cần index DB kỹ*
| Method | Endpoint | Action | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/analytics/summary` | Khái quát dữ liệu | Box thông tin: `balance`, `income`, `expense` |
| GET | `/api/analytics/monthly` | Dữ liệu 12 tháng | Array 12 phần tử vẽ Bar Chart |
| GET | `/api/analytics/daily-heatmap`| Heatmap | Trả về 35 dòng dữ liệu dựa trên SUM theo `DATE()` |

---

## 3. Các Lý Do Nâng Cấp Để Hệ Thống "Chuẩn Chỉnh" & Trơn Tru
Nếu chỉ làm như bản V1 ở trên, MVP sẽ chạy được. Nhưng để scale trơn tru dài hạn, bắt buộc phải có 5 điểm thay đổi như thiết kế V2 này:

1. **Audit / Ledger cho Savings Goals**: Nếu chỉ lưu con số `saved` trong Goal, chúng ta mất dấu dòng tiền. Thực tế việc "Thêm tiền vào lợn đất" (Add Funds) sinh ra một giao dịch trừ tiền trên ví. Việc sử dụng `Transaction` với `type = transfer` & `linkedGoalId` giúp sổ sách không bao giờ bị vênh và truy xuất được lịch sử bỏ tiền tiết kiệm.
2. **Loại bỏ data thừa, tránh sai số (Data Anomaly)**: Biến `spent` của Budget và `saved` của Goal bị loại khỏi DB. Việc duy trì những con số static này sinh ra rất nhiều bug (VD: User sửa số tiền 1 giao dịch trong quá khứ -> phải chạy trigger update lại Budget/Goal). Tính tổng (SUM) động bằng query lúc GET sẽ đảm bảo đúng tuyệt đối.
3. **Soft Delete (Xóa Mềm) & Toàn Vẹn Khóa Ngoại**: Cập nhật hệ thống không ai xóa vật lý Category hay Transaction vì dễ làm sai hỏng lịch sử biến động. Thêm cột `deletedAt`. Database phải gắn `ON DELETE RESTRICT` Category đối với Transaction, khớp 100% với UI Frontend bạn đã code (ko cho xóa Category đang có Transaction). 
4. **Hiệu năng API (Pagination & Indexing)**: Bắt buộc API List Transaction có Phân trang (Offset/Limit) và DB thêm Composite Index cho `(userId, date)` vì App gọi API get data theo tháng cực nhiều.
5. **Độ chính xác Tiền Tệ**: Lưu ý DB dùng `DECIMAL(15,2)` vì kiểu `Float` sẽ bị lỗi sai số mất thập phân trong backend toán tài chính.
