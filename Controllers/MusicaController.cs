using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CRUD_Musica.Context;
using CRUD_Musica.Models;
using CRUD_Musica.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CRUD_Musica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicaController : ControllerBase
    {
        private readonly MusicaContext _context;
        public MusicaController(MusicaContext context)
        {
            _context = context;
        }

        [HttpPost("AddSongs")]
        public IActionResult AdicionarMusica(Musica musica)
        {
            _context.Musicas.Add(musica);
            _context.SaveChanges();
            return CreatedAtAction(nameof(ObterMusicaPorTitulo), new { titulo = musica.Titulo }, musica);
        }

        [HttpGet("ListSongs")]
        public IActionResult Listar()
        {
            var musicas = _context.Musicas.ToList();
            return Ok(musicas);
        }

        // Corrigido para incluir a barra e o nome do parâmetro igual ao do método
        [HttpGet("GetMusicByTitle/{titulo}")]
        public IActionResult ObterMusicaPorTitulo(string titulo)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();
            return Ok(musica);
        }

        [HttpGet("GetMusicByArtist/{artista}")]
        public IActionResult ObterMusicaPorArtista(string artista)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Artista == artista);
            if (musica == null) return NotFound();
            return Ok(musica);
        }
        [HttpPut("UpdateMusicByTitle/{titulo}")]
        public IActionResult AtualizarMusica(string titulo, MusicaMetadataUpdateDto musicaAtualizada)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();

            musica.Titulo = musicaAtualizada.Titulo;
            musica.Artista = musicaAtualizada.Artista;
            musica.Genero = musicaAtualizada.Genero;
            musica.Duracao = musicaAtualizada.Duracao;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("DeleteMusicByTitle/{titulo}")]
        public IActionResult DeletarMusica(string titulo)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();

            _context.Musicas.Remove(musica);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("AddSongWithFile")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AdicionarMusicaComArquivo([FromForm] MusicaUploadDto musicaDto)
        {
            // Comprime o arquivo da música
            using var memoryStreamMusica = new MemoryStream();
            await musicaDto.Arquivo.CopyToAsync(memoryStreamMusica);
            var arquivoComprimido = Compress(memoryStreamMusica.ToArray());

            // Comprime a capa do álbum se existir
            byte[] imagemCapaBytes = null;
            if (musicaDto.Capa != null)
            {
                using var memoryStreamCapa = new MemoryStream();
                await musicaDto.Capa.CopyToAsync(memoryStreamCapa);
                imagemCapaBytes = Compress(memoryStreamCapa.ToArray());
            }

            var musica = new Musica
            {
                Titulo = musicaDto.Titulo,
                Artista = musicaDto.Artista,
                Genero = musicaDto.Genero,
                Duracao = musicaDto.Duracao,
                ArquivoComprimido = arquivoComprimido,
                CapaDoAlbum = imagemCapaBytes
            };

            _context.Musicas.Add(musica);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObterMusicaPorTitulo), new { titulo = musica.Titulo }, musica);
        }
        [HttpGet("GetCover/{id}")]
        public IActionResult GetCover(int id)
        {
            var musica = _context.Musicas.Find(id);
            if (musica == null || musica.CapaDoAlbum == null)
                return NotFound();

            var capaDescomprimida = Decompress(musica.CapaDoAlbum);

            // Ajuste o content-type conforme o formato da imagem que você espera (jpeg, png...)
            return File(capaDescomprimida, "image/jpeg");
        }

        // Método para comprimir bytes usando GZip
        private byte[] Compress(byte[] data)
        {
            using var compressedStream = new MemoryStream();
            using (var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Compress))
            {
                gzipStream.Write(data, 0, data.Length);
            }
            return compressedStream.ToArray();
        }
        private byte[] Decompress(byte[] compressedData)
        {
            using var compressedStream = new MemoryStream(compressedData);
            using var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Decompress);
            using var resultStream = new MemoryStream();
            gzipStream.CopyTo(resultStream);
            return resultStream.ToArray();
        }
        [HttpGet("PlayMusic/{id}")]
        public IActionResult TocarMusica(int id)
        {
            var musica = _context.Musicas.Find(id);
            if (musica == null || musica.ArquivoComprimido == null)
                return NotFound();

            var arquivoDescomprimido = Decompress(musica.ArquivoComprimido);

            var stream = new MemoryStream(arquivoDescomprimido);

            return new FileStreamResult(stream, "audio/mpeg")
            {
                FileDownloadName = $"{musica.Titulo}.mp3"
            };
        }


    }
}
