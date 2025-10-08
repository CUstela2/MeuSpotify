using Microsoft.EntityFrameworkCore;
using CRUD_Musica.Context;

var builder = WebApplication.CreateBuilder(args);

// Configurar o DbContext para usar SQLite
builder.Services.AddDbContext<MusicaContext>(options =>
    options.UseSqlite("Data Source=musica.db"));

builder.Services.AddControllers();

// Configuração do CORS para liberar todas as origens (apenas para teste)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS antes de authorization e MapControllers
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
