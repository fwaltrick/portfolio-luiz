import React from 'react'

const AboutPage = () => {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-staatliches font-bold mb-6">Über Luiz</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <p className="text-lg mb-4">
            Luiz Dominguez ist ein erfahrener Designer mit Fokus auf
            Ausstellungsdesign und visuelle Kommunikation.
          </p>
          <p className="mb-4">
            Mit über 15 Jahren Erfahrung hat Luiz für renommierte Museen und
            Kulturinstitutionen auf der ganzen Welt gearbeitet. Seine Arbeit
            verbindet ästhetische Exzellenz mit informativen Inhalten, um
            überzeugende visuelle Narrativen zu schaffen.
          </p>
          <p>Luiz lebt und arbeitet in Berlin, Deutschland.</p>
        </div>

        <div>
          {/* Placeholder para imagem */}
          <div className="bg-gray-200 aspect-square flex items-center justify-center">
            Foto de Luiz
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
