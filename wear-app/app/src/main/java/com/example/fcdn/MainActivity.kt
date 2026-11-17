package com.example.fcdn

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.example.fcdn.data.ApiClient
import com.example.fcdn.ui.BookListScreen
import com.example.fcdn.ui.ChapterListScreen
import com.example.fcdn.ui.QrPairingScreen
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("fcdn_wear_prefs", Context.MODE_PRIVATE)

        setContent {
            MaterialTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black)
                ) {
                    AppNavigation(prefs = prefs)
                }
            }
        }
    }
}

@Composable
fun AppNavigation(prefs: android.content.SharedPreferences) {
    var user_id by remember { mutableStateOf(prefs.getString("user_id", null)) }
    var user_data by remember { mutableStateOf<JSONObject?>(null) }
    var selected_book by remember { mutableStateOf<String?>(null) }
    var is_loading by remember { mutableStateOf(false) }
    var error_msg by remember { mutableStateOf<String?>(null) }

    val coroutine_scope = rememberCoroutineScope()

    fun parseChapHist(data: JSONObject?): Map<String, List<Int>> {
        if (data == null) return emptyMap()
        val result = mutableMapOf<String, List<Int>>()
        val keys = data.keys()
        while (keys.hasNext()) {
            val book = keys.next()
            val book_obj = data.optJSONObject(book)
            if (book_obj != null) {
                val arr = book_obj.optJSONArray("chap_history")
                val list = mutableListOf<Int>()
                if (arr != null) {
                    for (i in 0 until arr.length()) {
                        list.add(arr.getInt(i))
                    }
                }
                result[book] = list
            }
        }
        return result
    }

    fun fetchData() {
        val uid = user_id ?: return
        is_loading = true
        error_msg = null
        coroutine_scope.launch(Dispatchers.IO) {
            val data = ApiClient.fetchUserData(uid)
            withContext(Dispatchers.Main) {
                is_loading = false
                if (data != null) {
                    user_data = data
                } else {
                    error_msg = "Échec du chargement des données"
                }
            }
        }
    }

    LaunchedEffect(user_id) {
        if (user_id != null && user_data == null) {
            fetchData()
        }
    }

    if (user_id == null) {
        QrPairingScreen(
            onPaired = { new_uid ->
                prefs.edit().putString("user_id", new_uid).apply()
                user_id = new_uid
            }
        )
    } else if (is_loading && user_data == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            androidx.wear.compose.material.CircularProgressIndicator()
        }
    } else if (error_msg != null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(text = error_msg ?: "Erreur", color = MaterialTheme.colorScheme.error)
        }
    } else {
        val data = user_data
        if (data != null) {
            val parsed_map = parseChapHist(data)
            if (selected_book == null) {
                val book_keys = parsed_map.keys.toList()
                BookListScreen(
                    book_list = book_keys,
                    onSelectBook = { book ->
                        selected_book = book
                    },
                    onLogout = {
                        prefs.edit().remove("user_id").apply()
                        user_id = null
                        user_data = null
                        selected_book = null
                    }
                )
            } else {
                val book = selected_book!!
                val chap_hist = parsed_map[book] ?: emptyList()
                ChapterListScreen(
                    book_name = book,
                    chap_history = chap_hist,
                    onBack = { selected_book = null },
                    onUpdateHistory = { new_hist ->
                        val book_obj = data.optJSONObject(book) ?: JSONObject()
                        val new_arr = JSONArray()
                        new_hist.forEach { new_arr.put(it) }
                        book_obj.put("chap_history", new_arr)
                        data.put(book, book_obj)

                        user_data = JSONObject(data.toString())

                        coroutine_scope.launch(Dispatchers.IO) {
                            ApiClient.saveUserData(user_id!!, data)
                        }
                    }
                )
            }
        }
    }
}
