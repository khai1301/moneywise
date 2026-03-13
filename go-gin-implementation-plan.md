# Hướng dẫn xây dựng Backend MoneyWise với Go & Gin

Việc chọn Go và framework [Gin](https://gin-gonic.com/) là một quyết định tuyệt vời cho hệ thống tài chính vì Go có hiệu năng rất cao, xử lý đồng thời (concurrency) tốt và kiểu dữ liệu tĩnh nghiêm ngặt giúp tránh lỗi vặt.

Dưới đây là bức tranh tổng quan và các bước (step-by-step) để bạn xây dựng backend này từ con số 0.

---

## 1. Stack Công Nghệ & Packages Khuyên Dùng

Để xây dựng đầy đủ các tính năng trong `backend-overview.md`, bạn sẽ cần các thư viện Go sau:
*   **Web Framework:** `github.com/gin-gonic/gin` (Routing, Middleware, HTTP req/res).
*   **ORM (Database):** `gorm.io/gorm` và `gorm.io/driver/postgres` (Tương tác với PostgreSQL).
*   **Authentication:** `github.com/golang-jwt/jwt/v5` (Tạo và xác thực JWT token) và `golang.org/x/crypto/bcrypt` (Hash mật khẩu).
*   **Configuration:** `github.com/spf13/viper` (Đọc các file `.env` hoặc `config.yaml`).
*   **Hot Reload:** `github.com/cosmtrek/air` (Tự động restart server khi code thay đổi lúc dev).

---

## 2. Cấu Trúc Thư Mục (Project Structure)

Nên áp dụng kiến trúc **Clean Architecture** (hoặc Controller-Service-Repository) phổ biến trong cộng đồng Go để code dễ bảo trì:

```text
moneywise-backend/
├── cmd/
│   └── api/
│       └── main.go           # Entry point của ứng dụng (Khởi tạo DB, Router, chạy server)
├── internal/
│   ├── config/               # Load cấu hình từ file .env (DB URI, JWT Secret...)
│   ├── models/               # Định nghĩa các structs của GORM tương ứng với Database (User, Transaction...)
│   ├── repository/           # Tầng tương tác trực tiếp với DB (CRUD: Create, Read, Update, Delete)
│   ├── service/              # Tầng chứa Business Logic (Tính toán, validate các luật nghiệp vụ)
│   ├── handler/              # (Hoặc controller) Nhận HTTP Request từ Gin, gọi tới Service, và trả về HTTP Response
│   ├── middleware/           # Các hàm chắn ngang request (Auth, Logger, CORS, Error Handler)
│   └── routes/               # Định nghĩa các URL path nối với Handler
├── pkg/
│   └── utils/                # Các hàm helper dùng chung (Hash password, Parse date, Định dạng tiền tệ...)
├── .env                      # File chứa biến môi trường (Không commit lên Git)
├── go.mod                    # Quản lý dependencies
└── go.sum
```

---

## 3. Các Bước Thực Hiện (Step-by-Step)

### Bước 1: Khởi tạo Project & Cài đặt thư viện
```bash
# Khởi tạo Go module
go mod init github.com/yourusername/moneywise-backend

# Cài đặt Gin và GORM
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres

# Cài đặt Auth & Config
go get -u github.com/golang-jwt/jwt/v5
go get -u golang.org/x/crypto/bcrypt
go get -u github.com/spf13/viper
```

### Bước 2: Thiết lập Database Connection & Models
*   Tạo file cấu hình `.env` chứa chuỗi kết nối PostgreSQL.
*   Trong thư mục `internal/models/`, tạo các file `user.go`, `category.go`, `transaction.go`... chứa các struct `type User struct` với các tags của GORM (vd: `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`).
*   Tại `main.go`, khởi tạo connection GORM và gọi `db.AutoMigrate(&models.User{}, ...)` để Go tự động tạo các bảng trong CSDL (Chỉ dùng lúc dev).

### Bước 3: Xây dựng Flow Đăng ký / Đăng nhập (Auth)
*   **Repository (`user_repo.go`)**: Hàm `CreateUser(user)` và `GetUserByEmail(email)`.
*   **Service (`auth_service.go`)**: Hàm `Register` (nhận email/pass, dùng bcrypt hash pass rồi lưu DB) và `Login` (kiểm tra pass, tạo chuỗi JWT).
*   **Handler (`auth_handler.go`)**: Nhận JSON request (Gin binding), gọi Service và trả về token cho frontend.
*   **Middleware (`auth_middleware.go`)**: Viết middleware đọc header `Authorization: Bearer <token>`, parse token để lấy mảng `userId` và nhét `userId` đó vào trong `gin.Context`.

### Bước 4: Xây dựng Module Category
Làm theo luồng cơ bản (CRUD):
*   Tạo repo `GetCategoriesByUserId`, `CreateCategory`.
*   Tạo service để validate: "Nếu type không phải income/expense thì báo lỗi".
*   Tạo handler bắt các route POST/GET `/api/categories` **(Nhớ gán Auth middleware cho route này)**, trích xuất `userId` từ `gin.Context` (vừa được middleware gắn vào) để query đúng data của user đang đăng nhập.

### Bước 5: Xây dựng Module Transaction / Budget / Goal
*   *Đây là bộ lõi quan trọng nhất.* Định nghĩa các struct Transaction.
*   Trong `transaction_repo.go`, viết hàm `ListTransactions(userId, page, limit, startDate, endDate)` sử dụng GORM scopes để query lọc và phân trang.
*   Trong `budget_service.go`, tận dụng cơ chế JOIN của GORM hoặc query SUM các transaction thuộc `categoryId` để tính ra số `spent` trả về cho FE.

### Bước 6: Xây dựng Module Analytics (Thống kê)
*   Sử dụng GORM Raw SQL Queries hoặc `db.Model(&Transaction{}).Select("date, sum(amount)").Group("date")` (Hàm aggregations của database) để trả ra dữ liệu biểu đồ.
*   Đây là chỗ chứng minh sức mạnh của Backend, đẩy mọi việc tính toán Data phức tạp (Nhóm theo ngày, theo tháng) xuống bộ máy Database PostgreSQL làm thay vì dùng code Go chạy vòng lặp.

### Bước 7: Cấu hình CORS & Error Handling
*   Bật middleware CORS của Gin trong `main.go` để domain Frontend Next.js có quyền gọi API mà không bị chặn (CORS Error).
*   Tạo 1 middleware chuẩn hóa dữ liệu trả về kiểu JSON (Ví dụ: Mọi response lỗi đều trả về dưới dạng: `{"error": "message", "status": 400}`).

---

## 4. Ví dụ luồng code cho 1 API (Khuyên dùng)

Lấy ví dụ tạo chức năng **Lấy danh sách Danh mục**:

1. **`internal/models/category.go`**: `type Category struct { ... }`
2. **`internal/repository/category_repo.go`**:
   ```go
   func (r *categoryRepo) FindByUserID(userID string) ([]models.Category, error) {
       var categories []models.Category
       err := r.db.Where("user_id = ? AND deleted_at IS NULL", userID).Find(&categories).Error
       return categories, err
   }
   ```
3. **`internal/service/category_service.go`**: Hàm `GetCategories(userID string)` gọi đến Repo.
4. **`internal/handler/category_handler.go`**: 
   ```go
   func (h *CategoryHandler) GetList(c *gin.Context) {
       userID := c.GetString("user_id") // Lấy từ Middleware
       categories, err := h.service.GetCategories(userID)
       // Xử lý error hoặc success
       c.JSON(http.StatusOK, gin.H{"data": categories})
   }
   ```
5. **`internal/routes/api.go`**:
   ```go
   categoryGroup := r.Group("/api/categories")
   categoryGroup.Use(middleware.RequireAuth()) // Chặn token
   {
       categoryGroup.GET("", categoryHandler.GetList)
   }
   ```
