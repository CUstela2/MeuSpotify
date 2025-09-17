using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRUD_Musica.Migrations
{
    /// <inheritdoc />
    public partial class AddArquivoComprimidoToMusica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "ArquivoComprimido",
                table: "Musicas",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArquivoComprimido",
                table: "Musicas");
        }
    }
}
