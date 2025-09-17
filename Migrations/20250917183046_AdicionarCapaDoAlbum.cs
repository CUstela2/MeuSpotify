using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRUD_Musica.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCapaDoAlbum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "CapaDoAlbum",
                table: "Musicas",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CapaDoAlbum",
                table: "Musicas");
        }
    }
}
