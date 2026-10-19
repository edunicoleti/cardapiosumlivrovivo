"""
Gera o PDF do livro a partir do .docx da autora, com o sumário certo.

`soffice --convert-to pdf` direto NÃO serve: o sumário sai com os números de
página da última paginação feita no Word, e na versão de out/2026 isso errava
72 das 106 entradas. Aqui o documento abre pelo UNO, o sumário é atualizado
com a paginação do próprio LibreOffice (duas passadas, porque o sumário novo
pode mudar de tamanho) e só então é exportado.

Uso (com o python que vem dentro do LibreOffice, que já traz o módulo uno):
  "C:/Program Files/LibreOffice/program/python.exe" scripts/livro-para-pdf.py "LIVRO VIVO.docx" livro.pdf

O PDF sobe para o site pela administração (/app/admin.php). ATENÇÃO: este
repositório é público; nem o .docx nem o PDF podem ser comitados.
"""
import os
import subprocess
import sys
import time

import uno
from com.sun.star.beans import PropertyValue

SOFFICE = r'C:\Program Files\LibreOffice\program\soffice.exe'
entrada, saida = (os.path.abspath(a) for a in sys.argv[1:3])


def prop(nome, valor):
    p = PropertyValue()
    p.Name, p.Value = nome, valor
    return p


proc = subprocess.Popen([SOFFICE, '--headless', '--norestore', '--nologo',
                         '--accept=socket,host=127.0.0.1,port=2083;urp;'])
ctx = None
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
for _ in range(60):
    try:
        ctx = resolver.resolve('uno:socket,host=127.0.0.1,port=2083;urp;StarOffice.ComponentContext')
        break
    except Exception:
        time.sleep(1)
if ctx is None:
    proc.kill()
    sys.exit('LibreOffice nao respondeu')

desktop = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(entrada), '_blank', 0, (prop('Hidden', True),))
try:
    indices = doc.getDocumentIndexes()
    # duas passadas: o sumario atualizado pode mudar de tamanho e empurrar as paginas
    for _ in range(2):
        for i in range(indices.getCount()):
            indices.getByIndex(i).update()
        doc.getTextFields().refresh()
    print('sumarios atualizados:', indices.getCount())
    filtro = uno.Any('[]com.sun.star.beans.PropertyValue', tuple([
        prop('ExportBookmarks', True),
        prop('UseTaggedPDF', True),
        prop('Quality', 90),
        prop('ReduceImageResolution', False),
    ]))
    doc.storeToURL(uno.systemPathToFileUrl(saida), (prop('FilterName', 'writer_pdf_Export'), prop('FilterData', filtro)))
    print('gravado', saida)
finally:
    doc.close(True)
    try:
        desktop.terminate()
    except Exception:
        pass
    proc.wait(timeout=60)
