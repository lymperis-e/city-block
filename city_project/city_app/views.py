from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse



def home(request):
    return render(request, 'index.html')


def featureInfo(request, otid):
    from django.db import connections
   
    with connections['poldb'].cursor() as cursor:
        res = dict()


        # Oroi Domisis
        cursor.execute("SELECT * FROM [polgeodb].[dbo].[domisi] WHERE PARSENAME( [otid],3) = %s ", [otid])
        columns = [col[0] for col in cursor.description]
        res['oroi_domisis'] = [
            dict(zip(columns, row))
            for row in cursor.fetchall()]

        cursor.execute("SELECT * FROM [polgeodb].[dbo].[drpraxi] WHERE [drpraxid] IN (SELECT [drpraxid] FROM [polgeodb].[dbo].[drpraxiotall] WHERE PARSENAME([codeot],2) = %s)", [otid])
        columns = [col[0] for col in cursor.description]
        res['praxeis_analogismou'] = [
            dict(zip(columns, row))
            for row in cursor.fetchall()]
        


        return JsonResponse(res)
        row = cursor.fetchall()
        print(row)
    None


def normalizeDictKeys(item, category):
    if category == "oroi_domisis":
        norm_dict = {'Συντελεστής Δόμησης':         item['sd'],
                        'Μέγιστη Κάλυψη':           item['cover'],
                        'Μέγιστο Ύψος':             item['h'],
                        'Μέγιστος Αριθμός Ορόφων':  item['etage'],
                        'Οικοδομικό Σύστημα':       item['oiks']}
    elif category == "praxeis_analogismou":
        norm_dict = {{  'ID':                           item['analid'],
                        'Αρ. Πράξης':                   item['arpraxis'],
                        'Ημ/νια':                   str(item['dateprax']),
                        'Φάκελος':                      item['fakel'],
                        'Διεύθυνση':                    item['address'],
                        'Αριθμός Πρωτοκόλλου Κύρωσης':  item['arprotkyr'],
                        'Ημ/νια Κύρωσης':           str(item['datekyr']),
                        'ΟΤΑ':                          item['ota'],
                        'Τοπογραφικό':                  item['imagesxed'],
                        'Λεκτικό Πράξης':               item['imagetxtprx'],
                        'Λεκτικό Κύρωσης':              item['imagetxtkyr']
                        }}
    elif category == "diorthotiki_paxi":
        norm_dict = {'ID': item.drpraxid,
                        'Αριθμός Πρωτοκόλλου': item.drpraxi,
                        'Ημ/νια': str(item.datedim),
                        'Κωδικός': item.sxed,
                        'Τοπογραφικό': item.imagesxed,
                        'Λεκτικό Πράξης': item.imagetxtdrprx,
                        'Λεκτικό Κύρωσης': item.imagetxtdrkyr,
                        'Πίνακας Ιδιοκτησιών':item.imagetxtdrpnk
                        }

    elif category == "praxi_efarmogis":
        norm_dict = {}

    return norm_dict