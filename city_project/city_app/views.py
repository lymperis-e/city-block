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
        res['oroi_domisis'] = {'label': 'Όροι Δόμησης'}
        try:
            res['oroi_domisis']['data'] = [
                normalizeDictKeys(dict(zip(columns, row)), "oroi_domisis")
                for row in cursor.fetchall()]
        except:
            res['oroi_domisis']['data'] = "Δεν βρέθηκαν Όροι Δόμησης!"


        # Praxeis Analogismou
        cursor.execute("SELECT * FROM [polgeodb].[dbo].[anal] WHERE [analid] IN (SELECT [analid] FROM [polgeodb].[dbo].[analot] WHERE PARSENAME( [otid],3) = %s)", [otid])
        columns = [col[0] for col in cursor.description]
        res['praxeis_analogismou'] = {'label': 'Πράξεις Αναλογισμού'}
        try:
            res['praxeis_analogismou']['data'] = [
                normalizeDictKeys(dict(zip(columns, row)), "praxeis_analogismou")
                for row in cursor.fetchall()]
        except:
            res['praxeis_analogismou']['data'] = "Δεν βρέθηκαν Πράξεις Αναλογισμού!"
        

        # Diorthotikes Praxeis
        cursor.execute("SELECT * FROM [polgeodb].[dbo].[drpraxi] WHERE [drpraxid] IN (SELECT [drpraxid] FROM [polgeodb].[dbo].[drpraxiotall] WHERE PARSENAME([codeot],2) = %s)", [otid])
        columns = [col[0] for col in cursor.description]
        res['diorthotikes_praxeis'] = {'label': 'Διορθωτικές Πράξεις'}
        try:
            res['diorthotikes_praxeis']['data'] = [
                normalizeDictKeys(dict(zip(columns, row)), "diorthotikes_praxeis")
                for row in cursor.fetchall()]
        except:
            res['diorthotikes_praxeis']['data'] = "Δεν βρέθηκαν Διορθωτικές Πράξεις!"


        return JsonResponse(res)
       
   


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
    elif category == "diorthotikes_paxeis":
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