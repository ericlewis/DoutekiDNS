using System;
using System.IO;
using System.Net;
using System.Text;

namespace DoutekiDNS
{
    /// <summary>
    /// Windows client for DoutekiDNS
    /// </summary>
    class WindowsClient
    {
        static void Main(string[] args)
        {
            if (args.Length < 3)
            {
                Console.WriteLine("\nUsage: {0} <username:password> <host> <action>\n\nExample: {0} jdoe:mypassword www.example.com domains/delete/1\n", AppDomain.CurrentDomain.FriendlyName);
                return;
            }

            AttemptUpdate(args);
        }

        private static void AttemptUpdate(string[] args)
        {
            string usernamePassword = args[0];
            string host = args[1];
            string action = args[2];

            WebRequest request = HttpWebRequest.Create(String.Format("http://{0}/api/v1/update/{1}", host, action));
            request.Headers.Add(HttpRequestHeader.Authorization, "Basic " + Base64Encode(usernamePassword));

            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream receiveStream = response.GetResponseStream();
                StreamReader readStream = new StreamReader(receiveStream, Encoding.ASCII);
                string responsebody = readStream.ReadToEnd();
                Console.WriteLine(responsebody);
            }
            catch (WebException webex)
            {
                Console.WriteLine(webex.Message);
            }
        }

        public static string Base64Encode(string text)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
        }
    }
}
