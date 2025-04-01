#!/bin/zsh

# Verifica se a pasta components existe
if [ ! -d "components" ]; then
  echo "A pasta 'components' não foi encontrada. Certifique-se de estar no diretório correto."
  exit 1
fi

# Itera sobre todos os arquivos .tsx na pasta components
for file in components/*.tsx; do
  # Extrai o nome do componente (sem extensão)
  component_name=$(basename "$file" .tsx)

  # Cria a pasta com o nome do componente
  mkdir -p "components/$component_name"

  # Move o arquivo .tsx para a nova pasta
  mv "$file" "components/$component_name/$component_name.tsx"
  echo "Movido: $file -> components/$component_name/$component_name.tsx"

  # Verifica se existe um arquivo .css correspondente e move-o
  if [ -f "components/$component_name.css" ]; then
    mv "components/$component_name.css" "components/$component_name/$component_name.css"
    echo "Movido: components/$component_name.css -> components/$component_name/$component_name.css"
  fi
done

echo "Organização concluída!"