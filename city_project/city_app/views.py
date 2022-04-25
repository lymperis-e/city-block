from django.shortcuts import render
from django.contrib.auth.decorators import login_required




def home(request):
    return render(request, 'index.html')


def featureInfo(request):
    from django.db import connection

    None

from TOKENS.tokens import *
def getDB():
    '''Read the DB connection properties from the settings file and return its parameters'''
    host       =   SQLSERVER_TOKEN['HOST']
    db         =   SQLSERVER_TOKEN['DB']
    user       =   SQLSERVER_TOKEN['USER']
    passw      =   SQLSERVER_TOKEN['PASSWORD']
    return({
        'host': host,
        'db': db,
        'user': user,
        'passw': passw,
        'connection_string': "DRIVER={};SERVER={};DATABASE={};UID={};PWD={}".format('ODBC Driver 17 for SQL Server', host.replace('/', "\\"), db, user, passw)
    })