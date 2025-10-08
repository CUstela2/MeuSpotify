# Etapa 1: Build da aplicação
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo de projeto e restaura dependências
COPY *.csproj ./
RUN dotnet restore

# Copia o restante do código e faz o build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Runtime (imagem leve)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expõe a porta padrão do ASP.NET
EXPOSE 8080

# Define o comando para iniciar a aplicação
ENTRYPOINT ["dotnet", "CRUD_Musica.dll"]
