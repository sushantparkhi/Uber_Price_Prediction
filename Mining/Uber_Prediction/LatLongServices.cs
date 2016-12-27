using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Uber_Prediction
{
    class LatLongServices
    {
        const double EarthRadius = 6378137.0;
        const double DegreesToRadians = 0.0174532925;
        const double RadiansToDegrees = 57.2957795;

        public static LatLong CalculateDerivedPosition(LatLong source, double range, double bearing)
        {
            try
            {
                double latA = source.Latitude * DegreesToRadians;
                double lonA = source.Longitude * DegreesToRadians;
                double angularDistance = range / EarthRadius;
                double trueCourse = bearing * DegreesToRadians;

                double lat = Math.Asin(Math.Sin(latA) * Math.Cos(angularDistance) + Math.Cos(latA) * Math.Sin(angularDistance) * Math.Cos(trueCourse));

                double dlon = Math.Atan2(Math.Sin(trueCourse) * Math.Sin(angularDistance) * Math.Cos(latA), Math.Cos(angularDistance) - Math.Sin(latA) * Math.Sin(lat));
                double lon = ((lonA + dlon + Math.PI) % (Math.PI * 2)) - Math.PI;

                return new LatLong(lat * RadiansToDegrees, lon * RadiansToDegrees);
            }
            catch (Exception ex)
            {
                Console.WriteLine("%%%%%Error Occurred in Calculating Derived Position %%%%%%");
                Console.WriteLine(ex.Message);
                return source;
            }
        }
        public static LatLong GoogleGeocodingAPI(string Address, string apiKey)
        {
            try
            {

                var requestUri = string.Format("https://maps.googleapis.com/maps/api/geocode/xml?address={0}&sensor=false&key={1}", Uri.EscapeDataString(Address), apiKey);

                var request = WebRequest.Create(requestUri);
                var response = request.GetResponse();
                var xdoc = XDocument.Load(response.GetResponseStream());

                var result = xdoc.Element("GeocodeResponse").Element("result");
                if (result != null)
                {
                    var locationElement = result.Element("geometry").Element("location");
                    var lat = locationElement.Element("lat");
                    var lng = locationElement.Element("lng");
                    return new LatLong(Double.Parse(lat.Value.ToString()), Double.Parse(lng.Value.ToString()));
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("%%%%%Error Getting Geo-Code Data%%%%%");
                Console.WriteLine(ex.Message);
                return null;
            }
        }
        public static LatLong GeocodeAddress(string Address)
        {
            string[] apiKey = { "AIzaSyDO8PRUTQmrXPOO7HrLJExII22JJcGTNik", "AIzaSyBzbnVV021GrOkOIag-XwSeMfoeYwt2r50", "AIzaSyAnsOhbjT9TI9sN8WROZq4XxFSQIWdWD9U" };
            LatLong result;
            result = GoogleGeocodingAPI(Address, apiKey[0]);
            if (result == null)
            {
                result = GoogleGeocodingAPI(Address, apiKey[1]);
            }
            if (result == null)
            {
                result = GoogleGeocodingAPI(Address, apiKey[2]);
            }
            //if (result != null)
            //{
            //    IMongoClient _client = new MongoClient();
            //    IMongoDatabase _database = _client.GetDatabase("LatLongDb");
            //    var collection = _database.GetCollection<BsonDocument>("uberData");
            //    BsonDocument document = new BsonDocument(false);
            //    BsonElement Add = new BsonElement("address", BsonValue.Create(Address));
            //    string latlong = result.Latitude + ", " + result.Longitude;
            //    BsonElement LatLong = new BsonElement("latlong", BsonValue.Create(latlong));
            //    document.Add(Add);
            //    document.Add(LatLong);
            //    collection.InsertOne(document);
            //}
            return result;
        }

    }
}
