#!/bin/zsh

# Habilita o nullglob para evitar erros com padrões sem correspondência
setopt nullglob

# Define o caminho para a pasta components/
COMPONENTS_DIR="src/components"

# Itera sobre todas as pastas dentro de src/components/
for dir in $COMPONENTS_DIR/*/; do
  # Extrai o nome da pasta (sem a barra final)
  component_name=$(basename "$dir")

  # Cria o arquivo index.ts na pasta
  echo "export { default } from './$component_name';" > "$dir/index.ts"
  echo "Criado: $dir/index.ts"
done