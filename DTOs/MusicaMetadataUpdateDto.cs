using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRUD_Musica.DTOs
{
    public class MusicaMetadataUpdateDto
    {
        public string Titulo { get; set; }
        public string Artista { get; set; }
        public string Genero { get; set; }
        public int Duracao { get; set; }
    }
}
