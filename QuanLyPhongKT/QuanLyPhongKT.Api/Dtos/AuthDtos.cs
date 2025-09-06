namespace QuanLyPhongKT.Api.Dtos;

public record LoginRequest(string Email, string Password);
public record LoginResponse(int UserId, string Email, string FullName, string Role, string Token);
