#!/bin/bash

# Loop pelos arquivos na pasta atual
for file in *-00-thumbnail.*; do
    # Verifica se o padrão correspondeu a algum arquivo
    if [[ -e "$file" ]]; then
        # Extrai o nome do projeto (parte antes do primeiro hífen)
        project_name=$(echo "$file" | cut -d'-' -f1)
        
        # Cria uma pasta com o nome do projeto, se ainda não existir
        mkdir -p "$project_name"
        
        # Move o arquivo para a pasta e renomeia para "thumbnail.jpg"
        mv "$file" "$project_name/thumbnail.jpg"
    else
        echo "Nenhum arquivo encontrado com o padrão '*-00-thumbnail.*'."
        break
    fi
done

echo "Organização concluída!"
