using Microsoft.EntityFrameworkCore;
using CRUD_Musica.Context;

var builder = WebApplication.CreateBuilder(args);

// ----------------- Configurar DbContext SQLite -----------------
string dbPath;

// Detecta se está rodando no Render (variável de ambiente RENDER_EXTERNAL_HOSTNAME existe lá)
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RENDER_EXTERNAL_HOSTNAME")))
{
    // Deploy no Render com Persistent Disk
    dbPath = "/data/musica.db";
}
else
{
    // Local
    dbPath = "musica.db";
}

builder.Services.AddDbContext<MusicaContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// ----------------- Adicionar serviços -----------------
builder.Services.AddControllers();

// CORS: liberar todas as origens (apenas para teste)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ----------------- Middleware -----------------
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
