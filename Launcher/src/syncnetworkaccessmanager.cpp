#include "syncnetworkaccessmanager.h"
#include <QDebug>

SyncNetworAccesskManager::SyncNetworAccesskManager(QObject *parent) : QNetworkAccessManager(parent)
{

}

QNetworkReply* SyncNetworAccesskManager::post(const QNetworkRequest &request, const QByteArray &data)
{
    QNetworkReply* reply = QNetworkAccessManager::post(request, data);

    connect(reply, &QNetworkReply::errorOccurred, this, [=]
    {
        qDebug() << "Error code:" << reply->error();
        QString err = reply->errorString();
        qWarning() << "Network POST error:" << err;
    });

    while (!reply->isFinished())
        QCoreApplication::processEvents();

    return reply;
}

QNetworkReply* SyncNetworAccesskManager::get(const QNetworkRequest &request)
{
    QNetworkReply* reply = QNetworkAccessManager::get(request);

    connect(reply, &QNetworkReply::errorOccurred, this, [=]
    {
        qDebug() << "Error code:" << reply->error();
        QString err = reply->errorString();
        qWarning() << "Network GET error:" << err;
    });

    while (!reply->isFinished())
        QCoreApplication::processEvents();

    return reply;
}

QNetworkReply *SyncNetworAccesskManager::sendCustomRequest(const QNetworkRequest &request, const QByteArray &verb, QIODevice *data)
{
    QNetworkReply* reply = QNetworkAccessManager::sendCustomRequest(request, verb, data);

    connect(reply, &QNetworkReply::errorOccurred, this, [=]
    {
        qDebug() << "Error code:" << reply->error();
        QString err = reply->errorString();
        qWarning() << "Network CUSTOM error:" << err;
    });

    while (!reply->isFinished())
        QCoreApplication::processEvents();

    return reply;
}
